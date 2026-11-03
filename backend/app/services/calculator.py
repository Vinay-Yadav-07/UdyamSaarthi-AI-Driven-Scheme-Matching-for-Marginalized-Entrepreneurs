from typing import Dict, Any

DISCLAIMER_TEXT = "Illustrative EMI — actual terms are determined by the financing agency."

def calculate_emi(
    loan_amount: float,
    interest_rate_pa: float,
    tenure_years: float,
    moratorium_months: int = 0
) -> Dict[str, Any]:
    # Guard against negative / zero inputs
    if loan_amount <= 0 or tenure_years <= 0:
        return {
            "loan_amount": max(0.0, float(loan_amount)),
            "interest_rate_pa": max(0.0, float(interest_rate_pa)),
            "tenure_years": max(0.0, float(tenure_years)),
            "moratorium_months": max(0, int(moratorium_months)),
            "monthly_emi": 0.0,
            "total_repayment": max(0.0, float(loan_amount)),
            "total_interest": 0.0,
            "disclaimer": DISCLAIMER_TEXT
        }

    interest_rate_pa = max(0.0, float(interest_rate_pa))
    moratorium_months = max(0, int(moratorium_months))

    total_months = int(round(tenure_years * 12))
    repayment_months = max(total_months - moratorium_months, 1)

    r = (interest_rate_pa / 100.0) / 12.0

    if r == 0:
        monthly_emi = loan_amount / repayment_months
        total_repayment = loan_amount
        total_interest = 0.0
    else:
        # Standard EMI formula over active repayment months after moratorium
        monthly_emi = (loan_amount * r * ((1 + r) ** repayment_months)) / (((1 + r) ** repayment_months) - 1)
        total_repayment = monthly_emi * repayment_months
        total_interest = total_repayment - loan_amount

    return {
        "loan_amount": round(float(loan_amount), 2),
        "interest_rate_pa": round(float(interest_rate_pa), 2),
        "tenure_years": round(float(tenure_years), 2),
        "moratorium_months": moratorium_months,
        "monthly_emi": round(float(monthly_emi), 2),
        "total_repayment": round(float(total_repayment), 2),
        "total_interest": round(float(total_interest), 2),
        "disclaimer": DISCLAIMER_TEXT
    }
