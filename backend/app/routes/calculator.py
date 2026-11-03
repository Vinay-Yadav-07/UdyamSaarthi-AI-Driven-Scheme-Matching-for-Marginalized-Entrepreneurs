from fastapi import APIRouter
from app.schemas.calculator import EmiCalculatorRequest, EmiCalculatorResponse
from app.services.calculator import calculate_emi

router = APIRouter()

@router.post("/calculator/emi", response_model=EmiCalculatorResponse)
def compute_emi(req: EmiCalculatorRequest):
    res = calculate_emi(
        loan_amount=req.loan_amount,
        interest_rate_pa=req.interest_rate_pa,
        tenure_years=req.tenure_years,
        moratorium_months=req.moratorium_months
    )
    return EmiCalculatorResponse(**res)
