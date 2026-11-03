from app.db.database import get_db_connection
from app.db.seeder import seed_db
from app.services.chatbot import generate_chat_response

def test_chatbot_term_loan_en():
    conn = get_db_connection()
    seed_db(conn)
    res = generate_chat_response(conn, "What is the maximum loan under Term Loan?", "en")
    assert "reply" in res
    reply_lower = res["reply"].lower()
    assert "45" in reply_lower or "term loan" in reply_lower
    assert res["lang"] == "en"

def test_meaningful_eligibility_question_reaches_gemini():
    """Regression test: meaningful eligibility question receives full detailed answer."""
    conn = get_db_connection()
    seed_db(conn)
    res = generate_chat_response(conn, "eligibility requirements for loan", "en")
    assert "reply" in res
    reply_lower = res["reply"].lower()
    assert len(res["reply"]) > 100
    assert "scheduled caste" in reply_lower or "sc" in reply_lower or "income" in reply_lower

def test_hello_with_eligibility_question():
    """Regression test: 'Hello, what are the eligibility requirements' gets full answer."""
    conn = get_db_connection()
    seed_db(conn)
    res = generate_chat_response(conn, "Hello, what are the eligibility requirements for an NSFDC loan?", "en")
    assert "reply" in res
    reply_lower = res["reply"].lower()
    assert len(res["reply"]) > 100
    assert "caste" in reply_lower or "income" in reply_lower or "eligib" in reply_lower

def test_chatbot_unverified_npa_metrics():
    """Regression test: NPA queries disclaim unverified live metrics."""
    conn = get_db_connection()
    seed_db(conn)
    res = generate_chat_response(conn, "Which NSFDC channel partner has the lowest NPA?", "en")
    assert "reply" in res
    reply_lower = res["reply"].lower()
    assert "not publicly verified" in reply_lower or "unverified" in reply_lower or "cannot rank" in reply_lower or "npa" in reply_lower
