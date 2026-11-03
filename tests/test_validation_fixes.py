from app.schemas.recommendation import RecommendationRequest
from app.services.recommendation_engine import evaluate_recommendation

def test_1_project_cost_50k():
    req = RecommendationRequest(
        age=25, social_category="SC", caste_certificate="Yes",
        annual_family_income=150000.0, estimated_project_cost=50000.0,
        requested_loan_amount=40000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Micro Finance Scheme"
    assert res.maximum_eligible_loan == 45000.0  # 90% of 50k

def test_2_project_cost_100k():
    req = RecommendationRequest(
        age=28, social_category="SC", caste_certificate="Yes",
        annual_family_income=180000.0, estimated_project_cost=100000.0,
        requested_loan_amount=80000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Micro Finance Scheme"

def test_3_project_cost_125k():
    req = RecommendationRequest(
        age=30, social_category="SC", caste_certificate="Yes",
        annual_family_income=200000.0, estimated_project_cost=125000.0,
        requested_loan_amount=100000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Micro Finance Scheme"

def test_4_project_cost_140k_boundary():
    req = RecommendationRequest(
        age=32, social_category="SC", caste_certificate="Yes",
        annual_family_income=200000.0, estimated_project_cost=140000.0,
        requested_loan_amount=120000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Micro Finance Scheme"

def test_5_project_cost_150k():
    req = RecommendationRequest(
        age=32, social_category="SC", caste_certificate="Yes",
        annual_family_income=200000.0, estimated_project_cost=150000.0,
        requested_loan_amount=120000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Udyam Nidhi Yojana"
    assert res.maximum_eligible_loan == 135000.0  # 90% of 150k

def test_6_project_cost_500k_boundary():
    req = RecommendationRequest(
        age=35, social_category="SC", caste_certificate="Yes",
        annual_family_income=300000.0, estimated_project_cost=500000.0,
        requested_loan_amount=400000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Udyam Nidhi Yojana"

def test_7_project_cost_5000k_boundary():
    req = RecommendationRequest(
        age=40, social_category="SC", caste_certificate="Yes",
        annual_family_income=450000.0, estimated_project_cost=5000000.0,
        requested_loan_amount=4000000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Term Loan"

def test_8_requested_loan_120k_with_cost_150k():
    req = RecommendationRequest(
        age=28, social_category="SC", caste_certificate="Yes",
        annual_family_income=180000.0, estimated_project_cost=150000.0,
        requested_loan_amount=120000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    assert res.recommended_scheme == "Udyam Nidhi Yojana"
    assert res.illustrative_loan_amount == 120000.0

def test_9_requested_loan_greater_than_project_cost():
    # If requested loan exceeds maximum eligible loan, backend caps illustrative loan to maximum eligible loan
    req = RecommendationRequest(
        age=28, social_category="SC", caste_certificate="Yes",
        annual_family_income=180000.0, estimated_project_cost=150000.0,
        requested_loan_amount=200000.0, application_purpose="business"
    )
    res = evaluate_recommendation(req)
    assert res.eligibility_status == "Eligible"
    # Max eligible loan for 150k cost is 135k (90% of cost). Illustrative loan capped at max eligible loan.
    assert res.maximum_eligible_loan == 135000.0
    assert res.illustrative_loan_amount == 135000.0
