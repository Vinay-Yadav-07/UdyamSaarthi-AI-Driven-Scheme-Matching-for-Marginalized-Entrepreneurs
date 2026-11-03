import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "UdyamSaarthi API"
    VERSION: str = "6.0.0"
    TAGLINE: str = "Your Path to the Right Government Scheme"
    
    DATA_DIR: Path = BASE_DIR / "data"
    DB_PATH: Path = BASE_DIR / "udyam_saarthi.db"
    
    SCHEME_RULES_CSV: Path = DATA_DIR / "scheme_rules.csv"
    CHANNEL_PARTNERS_CSV: Path = DATA_DIR / "channel_partners.csv"
    PARTNER_STATUS_CSV: Path = DATA_DIR / "partner_status.csv"
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
