import csv
import sqlite3
from pathlib import Path
from app.config import settings

def init_db(conn: sqlite3.Connection):
    cursor = conn.cursor()
    
    # Create schemes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schemes (
        scheme_id TEXT PRIMARY KEY,
        scheme_name TEXT NOT NULL,
        scheme_type TEXT,
        purpose TEXT,
        max_project_cost_inr REAL,
        max_loan_inr TEXT,
        beneficiary_interest_rate TEXT,
        repayment_period TEXT,
        moratorium TEXT,
        channel TEXT,
        source TEXT,
        interest_rate_min_pa REAL,
        interest_rate_max_pa REAL
    );
    """)

    # Create channel partners table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS channel_partners (
        partner_id TEXT PRIMARY KEY,
        partner_name TEXT NOT NULL,
        partner_type TEXT,
        state TEXT,
        city TEXT,
        address TEXT,
        latitude REAL,
        longitude REAL,
        authorization_source TEXT,
        verification_scope TEXT,
        location_precision TEXT,
        live_status TEXT,
        data_status TEXT,
        nsfdc_authorization_verified TEXT,
        source_verification TEXT,
        live_partner_status TEXT,
        authorization_evidence TEXT
    );
    """)

    # Create partner status table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS partner_status (
        partner_id TEXT PRIMARY KEY,
        authorization_status TEXT,
        active_status TEXT,
        npa_percent REAL,
        overdue_amount_inr REAL,
        fund_utilization_percent REAL,
        status_source TEXT,
        data_status TEXT,
        FOREIGN KEY (partner_id) REFERENCES channel_partners (partner_id)
    );
    """)

    # Create recommendation logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        applicant_age INTEGER,
        social_category TEXT,
        caste_certificate TEXT,
        annual_family_income REAL,
        estimated_project_cost REAL,
        requested_loan_amount REAL,
        recommended_scheme TEXT,
        eligibility_status TEXT,
        eligibility_reason_code TEXT,
        suitability_score REAL
    );
    """)

    conn.commit()

def seed_db(conn: sqlite3.Connection):
    init_db(conn)
    cursor = conn.cursor()

    # Seed scheme_rules.csv
    if settings.SCHEME_RULES_CSV.exists():
        cursor.execute("DELETE FROM schemes;")
        with open(settings.SCHEME_RULES_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                max_cost = float(row['max_project_cost_inr']) if row['max_project_cost_inr'] else None
                min_rate = float(row['interest_rate_min_pa']) if row['interest_rate_min_pa'] else None
                max_rate = float(row['interest_rate_max_pa']) if row['interest_rate_max_pa'] else None
                cursor.execute("""
                    INSERT INTO schemes (
                        scheme_id, scheme_name, scheme_type, purpose, max_project_cost_inr,
                        max_loan_inr, beneficiary_interest_rate, repayment_period, moratorium,
                        channel, source, interest_rate_min_pa, interest_rate_max_pa
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row['scheme_id'], row['scheme_name'], row['scheme_type'], row['purpose'],
                    max_cost, row['max_loan_inr'], row['beneficiary_interest_rate'],
                    row['repayment_period'], row['moratorium'], row['channel'], row['source'],
                    min_rate, max_rate
                ))

    # Seed channel_partners.csv
    if settings.CHANNEL_PARTNERS_CSV.exists():
        cursor.execute("DELETE FROM channel_partners;")
        with open(settings.CHANNEL_PARTNERS_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                lat = float(row['latitude']) if row['latitude'] else None
                lng = float(row['longitude']) if row['longitude'] else None
                cursor.execute("""
                    INSERT INTO channel_partners (
                        partner_id, partner_name, partner_type, state, city, address,
                        latitude, longitude, authorization_source, verification_scope,
                        location_precision, live_status, data_status, nsfdc_authorization_verified,
                        source_verification, live_partner_status, authorization_evidence
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row['partner_id'], row['partner_name'], row['partner_type'], row['state'], row['city'],
                    row['address'], lat, lng, row['authorization_source'], row['verification_scope'],
                    row['location_precision'], row['live_status'], row['data_status'],
                    row['nsfdc_authorization_verified'], row['source_verification'],
                    row['live_partner_status'], row['authorization_evidence']
                ))

    # Seed partner_status.csv
    if settings.PARTNER_STATUS_CSV.exists():
        cursor.execute("DELETE FROM partner_status;")
        with open(settings.PARTNER_STATUS_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                npa = float(row['npa_percent']) if row['npa_percent'] else None
                overdue = float(row['overdue_amount_inr']) if row['overdue_amount_inr'] else None
                util = float(row['fund_utilization_percent']) if row['fund_utilization_percent'] else None
                cursor.execute("""
                    INSERT INTO partner_status (
                        partner_id, authorization_status, active_status, npa_percent,
                        overdue_amount_inr, fund_utilization_percent, status_source, data_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row['partner_id'], row['authorization_status'], row['active_status'],
                    npa, overdue, util, row['status_source'], row['data_status']
                ))

    conn.commit()
