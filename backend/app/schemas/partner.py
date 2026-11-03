from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class PartnerSearchRequest(BaseModel):
    state: Optional[str] = None
    city: Optional[str] = None
    partner_type: Optional[str] = None
    scheme_id: Optional[str] = None
    user_latitude: Optional[float] = None
    user_longitude: Optional[float] = None

class PartnerSchema(BaseModel):
    partner_id: str
    partner_name: str
    partner_type: str
    state: str
    city: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    authorization_source: str
    verification_scope: str
    location_precision: str
    location_notice: str = "Address-based location"
    live_status_notice: Optional[str] = None
    nsfdc_authorization_verified: str
    authorization_evidence: str
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
