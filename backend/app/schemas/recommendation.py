from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RecommendationRequest(BaseModel):
    age: int = Field(..., ge=18, le=70, description="Applicant age between 18 and 70")
    social_category: str = Field(..., description="SC or Non-SC")
    caste_certificate: str = Field(..., description="Yes or No")
    annual_family_income: float = Field(..., ge=0.0, description="Annual family income in INR")
    estimated_project_cost: float = Field(..., gt=0.0, description="Estimated project cost in INR")
    requested_loan_amount: float = Field(..., ge=0.0, description="Requested loan amount in INR")
    application_purpose: str = Field(default="business", description="business, education, etc.")
    project_type: Optional[str] = Field(default="income_generating_activity")
    education_status: Optional[str] = Field(default="Secondary")
    employment_status: Optional[str] = Field(default="self_employed")
    existing_business: Optional[str] = Field(default="No")
    business_experience_years: Optional[int] = Field(default=0)
    state: Optional[str] = Field(default=None)
    district: Optional[str] = Field(default=None)
    gender: Optional[str] = Field(default=None, description="Female, Male, Other")
    vocational_training: Optional[str] = Field(default=None, description="Formally Trained, NSFDC Trainee, None")
    promoter_contribution_ready: Optional[str] = Field(default=None, description="Yes or No")

class ExplainabilityDetails(BaseModel):
    why_this_scheme: List[str]
    rejection_reasons: List[str]
    scoring_breakdown: Dict[str, float]

class ApplicableScheme(BaseModel):
    scheme_id: str
    scheme_name: str
    eligibility_status: str = "Eligible"
    suitability_score: float
    maximum_project_cost: Optional[float] = None
    maximum_loan: float
    interest_rate: str
    interest_rate_pa: float
    repayment_period: str
    tenure_years: float
    moratorium: str
    channel: str
    why_it_matches: List[str]
    illustrative_monthly_emi: float
    is_best_match: bool = False
    scheme_details: Optional[Dict[str, Any]] = None

class SchemeRecommendationResult(BaseModel):
    recommended_scheme: str
    eligibility_status: str  # "Eligible" or "Ineligible"
    eligibility_reason_code: str
    maximum_eligible_loan: float
    illustrative_loan_amount: float
    illustrative_interest_rate_pa: float
    illustrative_tenure_years: float
    illustrative_monthly_emi: float
    alternate_scheme_option: str  # "None" or alternate scheme name
    suitability_score: float  # Percentage (e.g. 92.5)
    explainability: ExplainabilityDetails
    scheme_details: Optional[Dict[str, Any]] = None
    alternate_scheme_details: Optional[Dict[str, Any]] = None
    applicable_schemes: List[ApplicableScheme] = []
    best_match: Optional[ApplicableScheme] = None
    other_applicable_schemes: List[ApplicableScheme] = []

