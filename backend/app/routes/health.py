from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": settings.TAGLINE
    }
