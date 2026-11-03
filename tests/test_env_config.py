import os
from pathlib import Path
from app.config import settings

def test_backend_env_loading():
    # Verify backend config loads GEMINI_API_KEY property securely
    assert isinstance(settings.GEMINI_API_KEY, str)
    assert settings.PROJECT_NAME == "UdyamSaarthi API"
    assert settings.DB_PATH.name == "udyam_saarthi.db"

def test_no_secret_in_frontend_code():
    frontend_dir = Path(__file__).resolve().parent.parent / "frontend" / "src"
    assert frontend_dir.exists()
    
    for file_path in frontend_dir.rglob("*"):
        if file_path.is_file() and file_path.suffix in [".js", ".jsx", ".ts", ".tsx", ".html"]:
            content = file_path.read_text(encoding="utf-8")
            assert "VITE_GEMINI_API_KEY" not in content, f"Exposed VITE_GEMINI_API_KEY in {file_path.name}"
            assert "AI_KEY" not in content, f"Exposed AI_KEY in {file_path.name}"
