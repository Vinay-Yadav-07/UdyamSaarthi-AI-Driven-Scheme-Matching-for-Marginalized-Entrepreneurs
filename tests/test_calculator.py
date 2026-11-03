from app.services.calculator import calculate_emi

def test_normal_loan_emi():
    res = calculate_emi(loan_amount=250000.0, interest_rate_pa=8.0, tenure_years=5.0, moratorium_months=3)
    assert res["monthly_emi"] > 0
    assert res["total_repayment"] > 250000.0
    assert "Illustrative EMI — actual terms are determined by the financing agency." in res["disclaimer"]

def test_zero_interest_loan():
    res = calculate_emi(loan_amount=120000.0, interest_rate_pa=0.0, tenure_years=1.0, moratorium_months=0)
    assert res["monthly_emi"] == 10000.0
    assert res["total_interest"] == 0.0
    assert res["total_repayment"] == 120000.0

def test_moratorium_grace_period():
    # 3 years = 36 months, moratorium 6 months -> 30 repayment months
    res = calculate_emi(loan_amount=100000.0, interest_rate_pa=6.5, tenure_years=3.0, moratorium_months=6)
    assert res["monthly_emi"] > 0
    assert res["moratorium_months"] == 6

def test_invalid_negative_inputs():
    res = calculate_emi(loan_amount=-5000.0, interest_rate_pa=-2.0, tenure_years=-1.0, moratorium_months=-3)
    assert res["monthly_emi"] == 0.0
    assert res["loan_amount"] == 0.0

def test_very_large_loan_amount():
    res = calculate_emi(loan_amount=50000000.0, interest_rate_pa=8.5, tenure_years=10.0, moratorium_months=0)
    assert res["monthly_emi"] > 0
    assert res["total_repayment"] > 50000000.0
