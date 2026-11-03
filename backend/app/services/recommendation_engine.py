import math
import sqlite3
from typing import Dict, Any, Tuple, Optional, List
from app.schemas.recommendation import RecommendationRequest, SchemeRecommendationResult, ExplainabilityDetails, ApplicableScheme
from app.services.calculator import calculate_emi
from app.db.database import get_db_connection

def load_schemes_map(conn: sqlite3.Connection) -> Dict[str, Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes;")
    rows = cursor.fetchall()
    schemes_map = {}
    for r in rows:
        d = dict(r)
        schemes_map[d["scheme_name"]] = d
    return schemes_map

def calculate_scheme_suitability_score(
    req: RecommendationRequest,
    scheme_name: str,
    max_eligible_loan: float,
    illustrative_emi: float,
    max_cost_limit: Optional[float],
    min_rate: float
) -> Tuple[float, Dict[str, float]]:
    # 1. Eligibility compatibility (40%)
    c_eligibility = 40.0

    # 2. Project cost compatibility (20%)
    cost = req.estimated_project_cost
    if scheme_name in ["Micro Finance Scheme", "Aajeevika Micro-Finance Yojana"]:
        c_cost = 20.0
    elif scheme_name == "Udyam Nidhi Yojana":
        c_cost = 20.0 if cost > 140000.0 else 16.0
    elif scheme_name == "Term Loan":
        if cost > 500000.0:
            c_cost = 20.0
        elif cost > 140000.0:
            c_cost = 16.0
        else:
            c_cost = 12.0
    else:  # Educational Loan Scheme
        c_cost = 20.0

    # 3. Requested loan fit (15%) - ratio of requested loan to max eligible loan
    loan_ratio = min(req.requested_loan_amount / max(max_eligible_loan, 1.0), 1.0)
    c_loan_fit = round(15.0 * loan_ratio, 2)

    # 4. Purpose compatibility (15%)
    c_purpose = 15.0

    # 5. Repayment suitability (10%) - EMI vs monthly income DTI ratio
    monthly_income = max(req.annual_family_income / 12.0, 1.0)
    dti_ratio = illustrative_emi / monthly_income
    if dti_ratio <= 0.35:
        c_repayment = 10.0
    elif dti_ratio <= 0.50:
        c_repayment = 7.5
    elif dti_ratio <= 0.70:
        c_repayment = 5.0
    else:
        c_repayment = 2.5

    # 6. Low Interest Bonus (+2.5 bonus for lower interest rate schemes like MFS 6.5%)
    interest_bonus = 2.5 if min_rate <= 6.5 else (1.0 if min_rate <= 8.0 else 0.0)

    # 7. Gender & Priority Beneficiary Bonus (+2.5 for female entrepreneurs)
    gender_bonus = 2.5 if (req.gender == "Female" and scheme_name in ["Micro Finance Scheme", "Aajeevika Micro-Finance Yojana", "Term Loan"]) else 0.0

    # 8. Skill Training Fit Bonus (+2.5 for certified skill background)
    skill_bonus = 2.5 if (req.vocational_training and req.vocational_training != "None") else 0.0

    total_score = round(c_eligibility + c_cost + c_loan_fit + c_purpose + c_repayment + interest_bonus + gender_bonus + skill_bonus, 1)
    
    breakdown = {
        "eligibility_compatibility": c_eligibility,
        "project_cost_compatibility": c_cost,
        "requested_loan_fit": c_loan_fit,
        "purpose_compatibility": c_purpose,
        "repayment_suitability": c_repayment
    }
    return min(total_score, 100.0), breakdown


def evaluate_recommendation(req: RecommendationRequest, conn: Optional[sqlite3.Connection] = None) -> SchemeRecommendationResult:
    close_conn = False
    if conn is None:
        conn = get_db_connection()
        close_conn = True

    try:
        schemes_db_map = load_schemes_map(conn)
    finally:
        if close_conn and conn:
            conn.close()

    global_rejection_reasons = []

    # Stage 1: Global Hard Eligibility Filtering (General Applicant Rules)
    if req.social_category != "SC":
        global_rejection_reasons.append("Social category must be Scheduled Caste (SC) to qualify for NSFDC schemes.")

    if req.caste_certificate != "Yes":
        global_rejection_reasons.append("A valid SC Caste Certificate is required for verification.")

    if req.annual_family_income > 500000.0:
        global_rejection_reasons.append(f"Annual family income of ₹{req.annual_family_income:,.2f} exceeds the maximum scheme ceiling of ₹5,00,000.00.")

    is_education = (req.application_purpose == "education" or req.project_type == "professional_education")
    
    if not is_education and req.estimated_project_cost > 5000000.0:
        global_rejection_reasons.append(f"Estimated project cost of ₹{req.estimated_project_cost:,.2f} exceeds the maximum single-project ceiling of ₹50,00,000.00.")

    # If applicant is globally ineligible, return ineligible result with 0 applicable schemes
    if global_rejection_reasons:
        if req.social_category != "SC":
            code = "NON_SC"
        elif req.caste_certificate != "Yes":
            code = "MISSING_CASTE_CERT"
        elif req.annual_family_income > 500000.0:
            code = "INCOME_ABOVE_5L"
        else:
            code = "PROJECT_ABOVE_RANGE"

        return SchemeRecommendationResult(
            recommended_scheme="Not Eligible",
            eligibility_status="Ineligible",
            eligibility_reason_code=code,
            maximum_eligible_loan=0.0,
            illustrative_loan_amount=0.0,
            illustrative_interest_rate_pa=0.0,
            illustrative_tenure_years=0.0,
            illustrative_monthly_emi=0.0,
            alternate_scheme_option="None",
            suitability_score=0.0,
            explainability=ExplainabilityDetails(
                why_this_scheme=[],
                rejection_reasons=global_rejection_reasons,
                scoring_breakdown={
                    "eligibility_compatibility": 0.0,
                    "project_cost_compatibility": 0.0,
                    "requested_loan_fit": 0.0,
                    "purpose_compatibility": 0.0,
                    "repayment_suitability": 0.0
                }
            ),
            applicable_schemes=[],
            best_match=None,
            other_applicable_schemes=[]
        )

    # Stage 1 & 2: Evaluate All 5 Canonical Schemes
    canonical_schemes = [
        ("Micro Finance Scheme", "MFS"),
        ("Aajeevika Micro-Finance Yojana", "AMY"),
        ("Udyam Nidhi Yojana", "UNY"),
        ("Term Loan", "TERM_LOAN"),
        ("Educational Loan Scheme", "ELS")
    ]

    applicable_list: List[ApplicableScheme] = []

    for name, code in canonical_schemes:
        db_scheme = schemes_db_map.get(name, {})
        if not db_scheme:
            continue

        # Purpose check
        if name == "Educational Loan Scheme":
            if not is_education:
                continue
        else:
            if is_education:
                continue

        # Project Cost ceiling check
        max_cost_limit = db_scheme.get("max_project_cost_inr")
        if max_cost_limit is not None and req.estimated_project_cost > max_cost_limit:
            continue

        # Scheme is HARD ELIGIBLE! Gather parameters
        min_rate = float(db_scheme.get("interest_rate_min_pa") or 6.5)
        rate_display = db_scheme.get("beneficiary_interest_rate") or f"{min_rate}% p.a."
        moratorium_display = db_scheme.get("moratorium") or "3 months"
        repayment_display = db_scheme.get("repayment_period") or "3 years"
        channel_display = db_scheme.get("channel") or "SCAs/CAs"

        if name == "Educational Loan Scheme":
            max_loan_cap = 4000000.0
            tenure = 10.0
        elif name == "Micro Finance Scheme":
            max_loan_cap = 125000.0
            tenure = 3.0
        elif name == "Aajeevika Micro-Finance Yojana":
            max_loan_cap = 125000.0
            tenure = 3.0
        elif name == "Udyam Nidhi Yojana":
            max_loan_cap = 450000.0
            tenure = 5.0
        else:  # Term Loan
            max_loan_cap = 4500000.0
            tenure = 7.0

        max_eligible_loan = round(min(max_loan_cap, 0.90 * req.estimated_project_cost), 2)
        illustrative_loan = round(min(req.requested_loan_amount, max_eligible_loan), 2)

        emi_calc = calculate_emi(
            loan_amount=illustrative_loan,
            interest_rate_pa=min_rate,
            tenure_years=tenure,
            moratorium_months=0
        )
        monthly_emi = emi_calc["monthly_emi"]

        score, breakdown = calculate_scheme_suitability_score(
            req=req,
            scheme_name=name,
            max_eligible_loan=max_eligible_loan,
            illustrative_emi=monthly_emi,
            max_cost_limit=max_cost_limit,
            min_rate=min_rate
        )

        promoter_pct = 5.0 if req.estimated_project_cost <= 500000.0 else 10.0
        promoter_amount = round(req.estimated_project_cost * (promoter_pct / 100.0), 2)

        why_points = [
            "Scheduled Caste (SC) category & valid Caste Certificate verified.",
            f"Annual family income (₹{req.annual_family_income:,.2f}) satisfies threshold (≤ ₹5,00,000.00).",
            f"Project cost of ₹{req.estimated_project_cost:,.2f} fits within {name} guidelines.",
            f"Eligible loan calculated up to 90% of project cost (Max loan cap: ₹{max_eligible_loan:,.2f}).",
            f"Required promoter contribution: ₹{promoter_amount:,.2f} ({promoter_pct:.0f}% share).",
            f"Beneficiary interest rate: {rate_display} | Repayment tenure: {repayment_display}."
        ]

        if req.vocational_training and req.vocational_training != "None":
            why_points.append(f"Skill training verified: {req.vocational_training}.")

        if req.gender == "Female":
            why_points.append("Female applicant priority under MoSJE Women Empowerment guidelines.")

        app_scheme = ApplicableScheme(
            scheme_id=code,
            scheme_name=name,
            eligibility_status="Eligible",
            suitability_score=score,
            maximum_project_cost=max_cost_limit,
            maximum_loan=max_eligible_loan,
            interest_rate=rate_display,
            interest_rate_pa=min_rate,
            repayment_period=repayment_display,
            tenure_years=tenure,
            moratorium=moratorium_display,
            channel=channel_display,
            why_it_matches=why_points,
            illustrative_monthly_emi=monthly_emi,
            is_best_match=False,
            scheme_details=db_scheme
        )
        applicable_list.append(app_scheme)

    # Sort applicable schemes by suitability_score descending
    applicable_list.sort(key=lambda x: x.suitability_score, reverse=True)

    if not applicable_list:
        return SchemeRecommendationResult(
            recommended_scheme="Not Eligible",
            eligibility_status="Ineligible",
            eligibility_reason_code="NO_APPLICABLE_SCHEME",
            maximum_eligible_loan=0.0,
            illustrative_loan_amount=0.0,
            illustrative_interest_rate_pa=0.0,
            illustrative_tenure_years=0.0,
            illustrative_monthly_emi=0.0,
            alternate_scheme_option="None",
            suitability_score=0.0,
            explainability=ExplainabilityDetails(
                why_this_scheme=[],
                rejection_reasons=["No NSFDC scheme parameters matched the project cost and purpose."],
                scoring_breakdown={
                    "eligibility_compatibility": 0.0,
                    "project_cost_compatibility": 0.0,
                    "requested_loan_fit": 0.0,
                    "purpose_compatibility": 0.0,
                    "repayment_suitability": 0.0
                }
            ),
            applicable_schemes=[],
            best_match=None,
            other_applicable_schemes=[]
        )

    # #1 Ranked scheme is Best Match
    best_match = applicable_list[0]
    best_match.is_best_match = True
    other_applicable = applicable_list[1:]

    # Dataset alternate_scheme_option mapping field (preserved)
    cost = req.estimated_project_cost
    if is_education:
        dataset_alternate = "None"
    elif cost <= 140000.0:
        dataset_alternate = "Aajeevika Micro-Finance Yojana"
    else:
        dataset_alternate = "None"

    alt_db_scheme = schemes_db_map.get(dataset_alternate) if dataset_alternate != "None" else None

    top_breakdown = {
        "eligibility_compatibility": 40.0,
        "project_cost_compatibility": 20.0,
        "requested_loan_fit": round(15.0 * min(req.requested_loan_amount / max(best_match.maximum_loan, 1.0), 1.0), 2),
        "purpose_compatibility": 15.0,
        "repayment_suitability": 10.0
    }

    return SchemeRecommendationResult(
        recommended_scheme=best_match.scheme_name,
        eligibility_status="Eligible",
        eligibility_reason_code=best_match.scheme_id,
        maximum_eligible_loan=best_match.maximum_loan,
        illustrative_loan_amount=min(req.requested_loan_amount, best_match.maximum_loan),
        illustrative_interest_rate_pa=best_match.interest_rate_pa,
        illustrative_tenure_years=best_match.tenure_years,
        illustrative_monthly_emi=best_match.illustrative_monthly_emi,
        alternate_scheme_option=dataset_alternate,
        suitability_score=best_match.suitability_score,
        explainability=ExplainabilityDetails(
            why_this_scheme=best_match.why_it_matches,
            rejection_reasons=[],
            scoring_breakdown=top_breakdown
        ),
        scheme_details=best_match.scheme_details,
        alternate_scheme_details=alt_db_scheme,
        applicable_schemes=applicable_list,
        best_match=best_match,
        other_applicable_schemes=other_applicable
    )

