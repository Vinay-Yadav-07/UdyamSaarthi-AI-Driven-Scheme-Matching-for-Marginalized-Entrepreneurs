import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.database import get_db
from app.schemas.scheme import SchemeSchema

router = APIRouter()

@router.get("/schemes", response_model=List[SchemeSchema])
def get_all_schemes(conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes ORDER BY max_project_cost_inr ASC;")
    rows = cursor.fetchall()
    return [SchemeSchema.model_validate(dict(r)) for r in rows]

@router.get("/schemes/{scheme_id}", response_model=SchemeSchema)
def get_scheme_by_id(scheme_id: str, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE UPPER(scheme_id) = UPPER(?);", (scheme_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return SchemeSchema.model_validate(dict(row))
