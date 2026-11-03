from fastapi import APIRouter
from app.schemas.location import StateListResponse, DistrictListResponse
from app.services.location_service import get_all_states, get_districts_for_state

router = APIRouter()

@router.get("/locations/states", response_model=StateListResponse)
def get_states():
    states = get_all_states()
    return StateListResponse(states=states, total_states_and_uts=len(states))

@router.get("/locations/districts/{state}", response_model=DistrictListResponse)
def get_districts(state: str):
    districts = get_districts_for_state(state)
    return DistrictListResponse(state=state, districts=districts)
