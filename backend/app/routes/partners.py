import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.database import get_db
from app.schemas.partner import PartnerSearchRequest, PartnerSchema
from app.services.partner_locator import search_channel_partners

router = APIRouter()

@router.post("/partners/nearby", response_model=List[PartnerSchema])
def search_partners(req: PartnerSearchRequest, conn: sqlite3.Connection = Depends(get_db)):
    return search_channel_partners(conn, req)

@router.get("/partners/{partner_id}", response_model=PartnerSchema)
def get_partner(partner_id: str, conn: sqlite3.Connection = Depends(get_db)):
    search_req = PartnerSearchRequest()
    cursor = conn.cursor()
    cursor.execute("SELECT partner_id FROM channel_partners WHERE UPPER(partner_id) = UPPER(?);", (partner_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    results = search_channel_partners(conn, search_req)
    for p in results:
        if p.partner_id.upper() == partner_id.upper():
            return p
    raise HTTPException(status_code=404, detail="Partner details not found")
