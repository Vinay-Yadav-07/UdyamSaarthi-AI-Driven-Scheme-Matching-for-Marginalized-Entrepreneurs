import pytest
from app.schemas.recommendation import RecommendationRequest
from app.services.recommendation_engine import evaluate_recommendation

# ----------------------------------------------------------------------
# Exact Project Cost Boundary Tests Against scheme_rules.csv
# ----------------------------------------------------------------------

def test_exact_100k_cost():
    """Cost = ₹1,00,000 (Business).
    scheme_rules.csv caps:
    - MFS: max 140,000 -> ELIGIBLE (100k <= 140k)
    - AMY: max 140,000 -> ELIGIBLE (100k <= 140k)
    - UNY: max 500,000 -> ELIGIBLE (100k <= 500k)
    - TERM_LOAN: max 5,000,000 -> ELIGIBLE (100k <= 5M)
    Total 4 applicable schemes. Best match: Micro Finance Scheme (lowest interest rate 6.5%).
    """
    req = RecommendationRequest(
        age=25, social_category="SC", caste_certificate="Yes",
        annual_family_income=120000.0, estimated_project_cost=100000.0,
        requested_loan_amount=85000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert len(res.applicable_schemes) == 4
    scheme_names = [s.scheme_name for s in res.applicable_schemes]
    assert scheme_names == ["Micro Finance Scheme", "Aajeevika Micro-Finance Yojana", "Udyam Nidhi Yojana", "Term Loan"]
    
    assert res.best_match.scheme_name == "Micro Finance Scheme"
    assert len(res.other_applicable_schemes) == 3
    other_names = [s.scheme_name for s in res.other_applicable_schemes]
    assert other_names == ["Aajeevika Micro-Finance Yojana", "Udyam Nidhi Yojana", "Term Loan"]


def test_exact_140k_cost():
    """Cost = ₹1,40,000 (Business). Upper boundary for MFS & AMY.
    - MFS: max 140,000 -> ELIGIBLE (140k <= 140k)
    - AMY: max 140,000 -> ELIGIBLE (140k <= 140k)
    - UNY: max 500,000 -> ELIGIBLE (140k <= 500k)
    - TERM_LOAN: max 5,000,000 -> ELIGIBLE (140k <= 5M)
    Total 4 applicable schemes. Best match: Micro Finance Scheme.
    """
    req = RecommendationRequest(
        age=28, social_category="SC", caste_certificate="Yes",
        annual_family_income=200000.0, estimated_project_cost=140000.0,
        requested_loan_amount=120000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert len(res.applicable_schemes) == 4
    scheme_names = [s.scheme_name for s in res.applicable_schemes]
    assert scheme_names == ["Micro Finance Scheme", "Aajeevika Micro-Finance Yojana", "Udyam Nidhi Yojana", "Term Loan"]
    assert res.best_match.scheme_name == "Micro Finance Scheme"
    assert res.maximum_eligible_loan == 125000.0  # MFS max loan cap
    assert res.illustrative_loan_amount == 120000.0


def test_exact_140k_001_cost():
    """Cost = ₹1,40,001 (Business). 1 Rupee over MFS & AMY max cost cap.
    - MFS: max 140,000 -> INELIGIBLE (140,001 > 140,000)
    - AMY: max 140,000 -> INELIGIBLE (140,001 > 140,000)
    - UNY: max 500,000 -> ELIGIBLE (140,001 <= 500k)
    - TERM_LOAN: max 5,000,000 -> ELIGIBLE (140,001 <= 5M)
    Total 2 applicable schemes. Best match: Udyam Nidhi Yojana.
    """
    req = RecommendationRequest(
        age=28, social_category="SC", caste_certificate="Yes",
        annual_family_income=200000.0, estimated_project_cost=140001.0,
        requested_loan_amount=120000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert len(res.applicable_schemes) == 2
    scheme_names = [s.scheme_name for s in res.applicable_schemes]
    assert scheme_names == ["Udyam Nidhi Yojana", "Term Loan"]
    assert "Micro Finance Scheme" not in scheme_names
    assert "Aajeevika Micro-Finance Yojana" not in scheme_names
    assert res.best_match.scheme_name == "Udyam Nidhi Yojana"
    assert len(res.other_applicable_schemes) == 1
    assert res.other_applicable_schemes[0].scheme_name == "Term Loan"


def test_exact_150k_cost():
    """Cost = ₹1,50,000 (Business).
    - MFS: max 140,000 -> INELIGIBLE (150k > 140k)
    - AMY: max 140,000 -> INELIGIBLE (150k > 140k)
    - UNY: max 500,000 -> ELIGIBLE (150k <= 500k)
    - TERM_LOAN: max 5,000,000 -> ELIGIBLE (150k <= 5M)
    Total 2 applicable schemes. Best match: Udyam Nidhi Yojana.
    """
    req = RecommendationRequest(
        age=30, social_category="SC", caste_certificate="Yes",
        annual_family_income=250000.0, estimated_project_cost=150000.0,
        requested_loan_amount=120000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert len(res.applicable_schemes) == 2
    scheme_names = [s.scheme_name for s in res.applicable_schemes]
    assert scheme_names == ["Udyam Nidhi Yojana", "Term Loan"]
    assert res.best_match.scheme_name == "Udyam Nidhi Yojana"
    assert res.other_applicable_schemes[0].scheme_name == "Term Loan"
    assert res.maximum_eligible_loan == 135000.0  # 90% of 150k


def test_exact_500k_cost():
    """Cost = ₹5,00,000 (Business). Upper boundary for UNY.
    - MFS: max 140,000 -> INELIGIBLE (500k > 140k)
    - AMY: max 140,000 -> INELIGIBLE (500k > 140k)
    - UNY: max 500,000 -> ELIGIBLE (500k <= 500k)
    - TERM_LOAN: max 5,000,000 -> ELIGIBLE (500k <= 5M)
    Total 2 applicable schemes. Best match: Udyam Nidhi Yojana.
    """
    req = RecommendationRequest(
        age=35, social_category="SC", caste_certificate="Yes",
        annual_family_income=350000.0, estimated_project_cost=500000.0,
        requested_loan_amount=400000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert len(res.applicable_schemes) == 2
    scheme_names = [s.scheme_name for s in res.applicable_schemes]
    assert scheme_names == ["Udyam Nidhi Yojana", "Term Loan"]
    assert res.best_match.scheme_name == "Udyam Nidhi Yojana"
    assert res.other_applicable_schemes[0].scheme_name == "Term Loan"
    assert res.maximum_eligible_loan == 450000.0  # UNY cap: 450k
    assert res.illustrative_loan_amount == 400000.0


def test_exact_500k_001_cost():
    """Cost = ₹5,00,001 (Business). 1 Rupee over UNY max cost cap.
    - MFS: max 140,000 -> INELIGIBLE (500,001 > 140k)
    - AMY: max 140,000 -> INELIGIBLE (500,001 > 140k)
    - UNY: max 500,000 -> INELIGIBLE (500,001 > 500k)
    - TERM_LOAN: max 5,000,000 -> ELIGIBLE (500,001 <= 5M)
    Total 1 applicable scheme (Term Loan).
    """
    req = RecommendationRequest(
        age=35, social_category="SC", caste_certificate="Yes",
        annual_family_income=350000.0, estimated_project_cost=500001.0,
        requested_loan_amount=400000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert len(res.applicable_schemes) == 1
    scheme_names = [s.scheme_name for s in res.applicable_schemes]
    assert scheme_names == ["Term Loan"]
    assert res.best_match.scheme_name == "Term Loan"
    assert len(res.other_applicable_schemes) == 0


def test_exact_5000k_cost():
    """Cost = ₹50,00,000 (₹5,000,000, Business). Upper boundary for Term Loan.
    - MFS: max 140k -> INELIGIBLE
    - AMY: max 140k -> INELIGIBLE
    - UNY: max 500k -> INELIGIBLE
    - TERM_LOAN: max 5,000,000 -> ELIGIBLE (5M <= 5M)
    Total 1 applicable scheme (Term Loan).
    """
    req = RecommendationRequest(
        age=42, social_category="SC", caste_certificate="Yes",
        annual_family_income=450000.0, estimated_project_cost=5000000.0,
        requested_loan_amount=4000000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert len(res.applicable_schemes) == 1
    assert res.best_match.scheme_name == "Term Loan"
    assert len(res.other_applicable_schemes) == 0


def test_education_scenario():
    """Education Purpose: Only Educational Loan Scheme (ELS) is applicable."""
    req = RecommendationRequest(
        age=21, social_category="SC", caste_certificate="Yes",
        annual_family_income=300000.0, estimated_project_cost=1500000.0,
        requested_loan_amount=1200000.0, application_purpose="education",
        project_type="professional_education"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Educational Loan Scheme"
    assert len(res.applicable_schemes) == 1
    assert res.best_match.scheme_name == "Educational Loan Scheme"
    assert len(res.other_applicable_schemes) == 0


# ----------------------------------------------------------------------
# Ineligible / Zero Applicable Schemes Tests
# ----------------------------------------------------------------------

def test_no_applicable_schemes_non_sc():
    """Non-SC applicant: 0 applicable schemes."""
    req = RecommendationRequest(
        age=29, social_category="Non-SC", caste_certificate="No",
        annual_family_income=200000.0, estimated_project_cost=150000.0,
        requested_loan_amount=100000.0
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Ineligible"
    assert res.recommended_scheme == "Not Eligible"
    assert res.best_match is None
    assert len(res.applicable_schemes) == 0
    assert len(res.other_applicable_schemes) == 0


def test_no_applicable_schemes_income_above_5l():
    """Income > 5 Lakhs: 0 applicable schemes."""
    req = RecommendationRequest(
        age=35, social_category="SC", caste_certificate="Yes",
        annual_family_income=550000.0, estimated_project_cost=300000.0,
        requested_loan_amount=200000.0
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Ineligible"
    assert res.eligibility_reason_code == "INCOME_ABOVE_5L"
    assert res.best_match is None
    assert len(res.applicable_schemes) == 0
    assert len(res.other_applicable_schemes) == 0


def test_no_applicable_schemes_cost_above_5m():
    """Project cost > ₹50,00,000 (5M): 0 applicable schemes for business."""
    req = RecommendationRequest(
        age=45, social_category="SC", caste_certificate="Yes",
        annual_family_income=400000.0, estimated_project_cost=6000000.0,
        requested_loan_amount=4500000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Ineligible"
    assert res.eligibility_reason_code == "PROJECT_ABOVE_RANGE"
    assert res.best_match is None
    assert len(res.applicable_schemes) == 0
    assert len(res.other_applicable_schemes) == 0
