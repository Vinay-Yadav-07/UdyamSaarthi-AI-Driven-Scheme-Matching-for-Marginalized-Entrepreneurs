import math
import sqlite3
from typing import List, Dict, Any, Optional
from app.schemas.partner import PartnerSearchRequest, PartnerSchema

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def search_channel_partners(conn: sqlite3.Connection, search_req: PartnerSearchRequest) -> List[PartnerSchema]:
    cursor = conn.cursor()
    query = """
        SELECT cp.*, ps.authorization_status, ps.active_status
        FROM channel_partners cp
        LEFT JOIN partner_status ps ON cp.partner_id = ps.partner_id
        WHERE 1=1
    """
    params = []

    if search_req.state and search_req.state.strip():
        query += " AND LOWER(cp.state) LIKE LOWER(?)"
        params.append(f"%{search_req.state.strip()}%")

    if search_req.city and search_req.city.strip():
        query += " AND (LOWER(cp.city) LIKE LOWER(?) OR LOWER(cp.address) LIKE LOWER(?))"
        params.append(f"%{search_req.city.strip()}%")
        params.append(f"%{search_req.city.strip()}%")

    if search_req.partner_type and search_req.partner_type.strip():
        query += " AND LOWER(cp.partner_type) = LOWER(?)"
        params.append(search_req.partner_type.strip())

    cursor.execute(query, params)
    rows = cursor.fetchall()

    results = []
    for r in rows:
        lat = r["latitude"]
        lng = r["longitude"]
        dist = None
        if search_req.user_latitude is not None and search_req.user_longitude is not None and lat is not None and lng is not None:
            dist = haversine_distance(search_req.user_latitude, search_req.user_longitude, lat, lng)

        prec = r["location_precision"] or "approximate_address"
        if prec in ["approximate_address", "address_verified"]:
            loc_notice = "Address-based location"
        elif prec == "approximate_city":
            loc_notice = "City-based location"
        elif prec == "exact":
            loc_notice = "Exact location"
        elif prec == "unavailable":
            loc_notice = "Location unavailable"
        else:
            loc_notice = "Address-based location"

        partner_dict = {
            "partner_id": r["partner_id"],
            "partner_name": r["partner_name"],
            "partner_type": r["partner_type"],
            "state": r["state"],
            "city": r["city"],
            "address": r["address"],
            "latitude": lat,
            "longitude": lng,
            "authorization_source": r["authorization_source"] or "NSFDC Official Records",
            "verification_scope": r["verification_scope"] or "organization-level",
            "location_precision": prec,
            "location_notice": loc_notice,
            "live_status_notice": None,
            "nsfdc_authorization_verified": r["nsfdc_authorization_verified"] or "Yes",
            "authorization_evidence": r["authorization_evidence"] or "NSFDC source-backed organization reference",
            "distance_km": dist
        }
        results.append(PartnerSchema(**partner_dict))

    if search_req.user_latitude is not None and search_req.user_longitude is not None:
        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999999.0)

    return results
