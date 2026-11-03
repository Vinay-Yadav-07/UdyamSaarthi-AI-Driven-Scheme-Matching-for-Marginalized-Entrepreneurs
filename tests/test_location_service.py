from app.services.location_service import get_all_states, get_districts_for_state

REQUIRED_SAMPLE_LOCATIONS = [
    "Maharashtra", "Gujarat", "Kerala", "Assam", "Uttar Pradesh",
    "Jammu and Kashmir", "Ladakh", "Delhi", "Tamil Nadu", "Telangana"
]

def test_exact_36_states_and_uts_count():
    states = get_all_states()
    assert len(states) == 36, f"Expected 36 States/UTs, found {len(states)}"

def test_required_sample_locations_present():
    states = get_all_states()
    for loc in REQUIRED_SAMPLE_LOCATIONS:
        assert loc in states, f"Location '{loc}' missing from 36 States/UTs list"

def test_district_dropdown_data_for_sample_locations():
    for loc in REQUIRED_SAMPLE_LOCATIONS:
        districts = get_districts_for_state(loc)
        assert len(districts) > 0, f"No districts found for location '{loc}'"
