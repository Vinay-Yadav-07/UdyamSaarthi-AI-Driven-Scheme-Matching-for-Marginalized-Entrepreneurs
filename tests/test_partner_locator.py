from app.db.database import get_db_connection
from app.db.seeder import seed_db
from app.schemas.partner import PartnerSearchRequest
from app.services.partner_locator import search_channel_partners

def test_partner_search_and_notices():
    conn = get_db_connection()
    seed_db(conn)
    
    # Search for partners in Gujarat
    search_req = PartnerSearchRequest(state="Gujarat")
    partners = search_channel_partners(conn, search_req)
    
    assert len(partners) > 0
    for p in partners:
        assert p.location_notice == "Address-based location"
        assert p.live_status_notice is None
        assert p.state.lower() == "gujarat"

def test_partner_distance_calculation():
    conn = get_db_connection()
    seed_db(conn)
    
    # Coordinates near Vadodara (22.3072, 73.1812)
    search_req = PartnerSearchRequest(state="Gujarat", user_latitude=22.30, user_longitude=73.18)
    partners = search_channel_partners(conn, search_req)
    
    assert len(partners) > 0
    assert partners[0].distance_km is not None
    assert partners[0].distance_km < 10.0

def test_partner_api_returns_coordinates():
    """Regression test: partner API returns valid latitude and longitude for map rendering."""
    conn = get_db_connection()
    seed_db(conn)

    search_req = PartnerSearchRequest()
    partners = search_channel_partners(conn, search_req)
    assert len(partners) == 91

    for p in partners:
        assert p.latitude is not None and isinstance(p.latitude, float)
        assert p.longitude is not None and isinstance(p.longitude, float)
        assert 8.0 <= p.latitude <= 38.0  # Valid India latitude range
        assert 68.0 <= p.longitude <= 98.0  # Valid India longitude range

def test_partner_category_filtering():
    """Regression test: category filters match dataset partner_type values."""
    conn = get_db_connection()
    seed_db(conn)

    psb_partners = search_channel_partners(conn, PartnerSearchRequest(partner_type="PSB"))
    assert len(psb_partners) == 11

    rrb_partners = search_channel_partners(conn, PartnerSearchRequest(partner_type="RRB"))
    assert len(rrb_partners) == 26

    sca_partners = search_channel_partners(conn, PartnerSearchRequest(partner_type="SCA"))
    assert len(sca_partners) == 38

    coop_partners = search_channel_partners(conn, PartnerSearchRequest(partner_type="Cooperative Society"))
    assert len(coop_partners) == 2

