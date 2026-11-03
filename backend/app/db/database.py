import sqlite3
from typing import Generator
from app.config import settings
from app.db.seeder import seed_db

_seeded = False

def get_db_connection() -> sqlite3.Connection:
    global _seeded
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    if not _seeded:
        seed_db(conn)
        _seeded = True
    return conn

def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()
