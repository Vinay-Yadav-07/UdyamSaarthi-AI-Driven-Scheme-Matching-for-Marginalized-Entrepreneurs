from pydantic import BaseModel, Field
from typing import Optional

class EmiCalculatorRequest(BaseModel):
    loan_amount: float = Field(..., gt=0, description="Principal loan amount in INR")
    interest_rate_pa: float = Field(..., ge=0, description="Annual interest rate in percentage")
    tenure_years: float = Field(..., gt=0, description="Loan tenure in years")
    moratorium_months: Optional[int] = Field(default=0, ge=0, description="Grace period in months")

class EmiCalculatorResponse(BaseModel):
    loan_amount: float
    interest_rate_pa: float
    tenure_years: float
    moratorium_months: int
    monthly_emi: float
    total_repayment: float
    total_interest: float
    disclaimer: str = "Calculated values are illustrative estimates based on NSFDC scheme parameters."
