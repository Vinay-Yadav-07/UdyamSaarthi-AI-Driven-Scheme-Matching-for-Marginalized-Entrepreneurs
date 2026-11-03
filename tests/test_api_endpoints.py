from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "UdyamSaarthi" in data["service"]

def test_schemes_endpoint():
    response = client.get("/api/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) == 5

def test_recommendation_endpoint():
    payload = {
        "age": 25,
        "social_category": "SC",
        "caste_certificate": "Yes",
        "annual_family_income": 200000.0,
        "estimated_project_cost": 300000.0,
        "requested_loan_amount": 250000.0,
        "application_purpose": "business",
        "project_type": "income_generating_activity"
    }
    response = client.post("/api/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["eligibility_status"] == "Eligible"
    assert data["recommended_scheme"] == "Udyam Nidhi Yojana"
    assert "why_this_scheme" in data["explainability"]

def test_calculator_endpoint():
    payload = {
        "loan_amount": 100000.0,
        "interest_rate_pa": 6.5,
        "tenure_years": 3.0,
        "moratorium_months": 3
    }
    response = client.post("/api/calculator/emi", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["monthly_emi"] > 0

def test_locations_endpoints():
    res_states = client.get("/api/locations/states")
    assert res_states.status_code == 200
    assert res_states.json()["total_states_and_uts"] == 36

    res_districts = client.get("/api/locations/districts/Maharashtra")
    assert res_districts.status_code == 200
    assert "Mumbai" in res_districts.json()["districts"]

def test_partners_endpoint():
    payload = {"state": "Delhi"}
    response = client.post("/api/partners/nearby", json=payload)
    assert response.status_code == 200
    partners = response.json()
    assert len(partners) > 0

def test_chat_endpoint():
    payload = {"message": "What are the rules for Micro Finance Scheme?", "lang": "en"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
