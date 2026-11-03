import sqlite3
from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.schemas.recommendation import RecommendationRequest, SchemeRecommendationResult
from app.services.recommendation_engine import evaluate_recommendation

router = APIRouter()

@router.post("/recommend", response_model=SchemeRecommendationResult)
def get_recommendation(req: RecommendationRequest, conn: sqlite3.Connection = Depends(get_db)):
    result = evaluate_recommendation(req, conn)
    
    # Log recommendation to SQLite
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO recommendation_logs (
                applicant_age, social_category, caste_certificate, annual_family_income,
                estimated_project_cost, requested_loan_amount, recommended_scheme,
                eligibility_status, eligibility_reason_code, suitability_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            req.age, req.social_category, req.caste_certificate, req.annual_family_income,
            req.estimated_project_cost, req.requested_loan_amount, result.recommended_scheme,
            result.eligibility_status, result.eligibility_reason_code, result.suitability_score
        ))
        conn.commit()
    except Exception:
        pass

    return result
