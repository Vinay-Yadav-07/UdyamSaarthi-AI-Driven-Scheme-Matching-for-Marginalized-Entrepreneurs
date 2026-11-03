from pydantic import BaseModel
from typing import List

class StateListResponse(BaseModel):
    states: List[str]
    total_states_and_uts: int

class DistrictListResponse(BaseModel):
    state: str
    districts: List[str]
