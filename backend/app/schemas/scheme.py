from pydantic import BaseModel, ConfigDict
from typing import Optional

class SchemeSchema(BaseModel):
    scheme_id: str
    scheme_name: str
    scheme_type: str
    purpose: str
    max_project_cost_inr: Optional[float] = None
    max_loan_inr: str
    beneficiary_interest_rate: str
    repayment_period: str
    moratorium: str
    channel: str
    source: str
    interest_rate_min_pa: float
    interest_rate_max_pa: float

    model_config = ConfigDict(from_attributes=True)
