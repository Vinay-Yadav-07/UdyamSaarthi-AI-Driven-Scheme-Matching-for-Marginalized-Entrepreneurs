from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import get_db_connection
from app.db.seeder import seed_db
from app.routes import health, schemes, recommendation, calculator, partners, locations, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = get_db_connection()
    try:
        seed_db(conn)
    finally:
        conn.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend REST API for UdyamSaarthi - AI Scheme Matching & Recommendation Platform for Marginalized Entrepreneurs",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(schemes.router, prefix="/api", tags=["Schemes"])
app.include_router(recommendation.router, prefix="/api", tags=["Recommendation"])
app.include_router(calculator.router, prefix="/api", tags=["Calculator"])
app.include_router(partners.router, prefix="/api", tags=["Partners"])
app.include_router(locations.router, prefix="/api", tags=["Locations"])
app.include_router(chat.router, prefix="/api", tags=["Chatbot"])
