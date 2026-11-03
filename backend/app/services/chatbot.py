import os
import sqlite3
from typing import Dict, Any, List, Optional
from app.config import settings

SYSTEM_INSTRUCTIONS_EN = """
You are UdyamSaarthi AI, an AI assistant created for the SIH prototype to help users understand NSFDC financial schemes, eligibility requirements, loan terms, and channel partners.

GUIDELINES & INSTRUCTIONS:
1. Provide detailed, clear, polite, and helpful answers to the user's question.
2. When explaining NSFDC schemes (such as Micro Finance Scheme, Aajeevika Micro-Finance Yojana, Term Loan, Udyam Nidhi Yojana, Educational Loan Scheme), include useful parameters:
   - Purpose & Eligibility
   - Maximum Project Cost
   - Maximum Eligible Loan
   - Beneficiary Interest Rate
   - Repayment Tenure
   - Moratorium (Grace Period)
   - Channel Partners (SCAs, Banks, SFBs, NBFC-MFIs)
3. For questions regarding channel partner NPA percentages, overdue amounts, or live operational metrics:
   - State clearly that live financial metrics (NPA %, overdue amounts) for channel partners are NOT publicly verified in the reference dataset.
   - Do NOT invent or fabricate NPA rankings or overdue figures.
4. For general trivia or greetings (e.g. "Hello", "What is the capital of France?"):
   - For simple greetings, respond politely and invite their scheme questions.
   - For general trivia, answer politely and clearly.
5. Ground your information on the RETRIEVED DATABASE RECORDS provided below.
6. Do NOT claim to be an official government or official NSFDC government entity; state that you are UdyamSaarthi AI.
"""

SYSTEM_INSTRUCTIONS_HI = """
आप उद्यमसारथी AI (UdyamSaarthi AI) हैं, जो SIH प्रोटोटाइप के लिए उपयोगकर्ताओं को NSFDC वित्तीय योजनाओं, पात्रता शर्तों, ऋण नियमों और चैनल पार्टनर्स को समझने में मदद के लिए बनाया गया एक AI सहायक है।

दिशा-निर्देश:
1. उपयोगकर्ता के प्रश्न का विस्तृत, स्पष्ट और सहायक उत्तर दें।
2. NSFDC योजनाओं (जैसे MFS, AMY, Term Loan, UNY, ELS) के बारे में समझाते समय उद्देश्य, अधिकतम परियोजना लागत, अधिकतम ऋण, ब्याज दर, पुनर्भुगतान अवधि, मोरेटोरियम और चैनल पार्टनर्स की जानकारी शामिल करें।
3. चैनल पार्टनर्स के NPA % या ओवरड्यू विवरण पर बताएं कि लाइव वित्तीय आंकड़े संदर्भ डेटासेट में सार्वजनिक रूप से सत्यापित नहीं हैं। मनगढ़ंत NPA रैंकिंग न बनाएं।
4. सामान्य प्रश्नों पर विनम्रतापूर्वक उत्तर दें और बताएं कि आपकी मुख्य विशेषता NSFDC योजनाओं और पात्रता मार्गदर्शन में है।
5. खुद को आधिकारिक सरकारी संस्था या NSFDC का आधिकारिक सरकारी प्रतिनिधि न बताएं।
"""

def retrieve_grounded_context(conn: sqlite3.Connection, query: str) -> str:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes")
    all_schemes = cursor.fetchall()
    
    scheme_context_lines = []
    for s in all_schemes:
        s_dict = dict(s)
        cost_val = s_dict['max_project_cost_inr']
        cost_str = f"₹{cost_val:,.0f}" if cost_val is not None else "As per fee structure (Max ₹40 Lakhs)"
        min_r = f"{s_dict['interest_rate_min_pa']}%" if s_dict['interest_rate_min_pa'] is not None else "N/A"
        max_r = f"{s_dict['interest_rate_max_pa']}%" if s_dict['interest_rate_max_pa'] is not None else "N/A"

        line = (
            f"• Scheme: {s_dict['scheme_name']} (ID: {s_dict['scheme_id']})\n"
            f"  - Purpose: {s_dict['purpose']}\n"
            f"  - Max Project Cost: {cost_str} | Max Loan Limit: ₹{s_dict['max_loan_inr']}\n"
            f"  - Interest Rate: {s_dict['beneficiary_interest_rate']} (Min: {min_r}, Max: {max_r})\n"
            f"  - Repayment Tenure: {s_dict['repayment_period']} | Moratorium: {s_dict['moratorium']}\n"
            f"  - Authorized Channel: {s_dict['channel']}"
        )
        scheme_context_lines.append(line)

    cursor.execute("""
        SELECT cp.partner_id, cp.partner_name, cp.partner_type, cp.state, cp.city
        FROM channel_partners cp
        LIMIT 10
    """)
    partners = cursor.fetchall()
    partner_lines = []
    for p in partners:
        p_dict = dict(p)
        partner_lines.append(f"• {p_dict['partner_name']} ({p_dict['partner_type']}) - {p_dict['city']}, {p_dict['state']}")

    db_context = "=== REFERENCE SCHEME DATASET (Source of Truth) ===\n"
    db_context += "\n\n".join(scheme_context_lines) + "\n\n"
    db_context += "=== SAMPLE CHANNEL PARTNER ORGANIZATIONS ===\n"
    db_context += "\n".join(partner_lines) + "\n"
    db_context += "Note: Live financial metrics (NPA %, overdue amounts) for channel partners are NOT publicly verified in the dataset.\n"

    return db_context

def generate_chat_response(conn: sqlite3.Connection, message: str, lang: str = "en") -> Dict[str, Any]:
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    sources = ["Data used: UdyamSaarthi scheme rules and channel-partner reference datasets."]

    db_context = retrieve_grounded_context(conn, message)

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            system_instructions = SYSTEM_INSTRUCTIONS_HI if lang == "hi" else SYSTEM_INSTRUCTIONS_EN
            
            prompt = f"{system_instructions}\n\n{db_context}\nUSER QUESTION: {message}\nANSWER:"
            
            # Use gemini-3.6-flash as primary model, with fallback to gemini-2.5-flash
            for model_name in ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    if response and response.text and response.text.strip():
                        return {
                            "reply": response.text.strip(),
                            "grounded_sources": sources,
                            "retrieved_context": db_context,
                            "lang": lang
                        }
                except Exception:
                    continue
        except Exception:
            pass

    # Rule-grounded fallback logic if API fails or key is missing
    msg_lower = message.lower().strip()

    # Simple greeting with no further request
    if msg_lower in ["hello", "hi", "hey", "greetings", "namaste", "नमस्ते"]:
        if lang == "hi":
            reply = "नमस्ते! मैं उद्यमसारथी AI हूँ। मैं आपको NSFDC योजनाओं, पात्रता शर्तों, ऋण सीमाओं और चैनल पार्टनर्स के बारे में जानकारी प्रदान कर सकता हूँ। मैं आपकी कैसे सहायता कर सकता हूँ?"
        else:
            reply = "Hello! I am UdyamSaarthi AI. I can guide you on NSFDC financial schemes, eligibility requirements, interest rates, repayment tenure, and authorized channel partners. How can I help you today?"
        return {
            "reply": reply,
            "grounded_sources": sources,
            "retrieved_context": db_context,
            "lang": lang
        }

    # Answer eligibility / criteria / requirement questions (including typos like eligiblity)
    if any(k in msg_lower for k in ["eligib", "criteria", "qualify", "requirement", "income", "caste", "who can"]):
        if lang == "hi":
            reply = "NSFDC योजनाओं के लिए मुख्य पात्रता शर्तें:\n1. सामाजिक वर्ग: आवेदक अनुसूचित जाति (SC) श्रेणी से होना चाहिए।\n2. प्रमाण पत्र: वैध SC जाति प्रमाण पत्र अनिवार्य है।\n3. आय सीमा: वार्षिक पारिवारिक आय ≤ ₹5,00,000 होनी चाहिए।\n4. उद्देश्य: आय-उत्पादक व्यवसाय / उद्योग या उच्च व्यावसायिक शिक्षा।"
        else:
            reply = "Key Eligibility Requirements for NSFDC Schemes:\n\n1. **Social Category**: Applicant MUST belong to the Scheduled Caste (SC) category.\n2. **Caste Certificate**: A valid SC Caste Certificate is mandatory.\n3. **Annual Family Income**: Annual family income must be ≤ ₹5,00,000.\n4. **Application Purpose**: Income-generating business/enterprise activity or professional/technical higher education.\n5. **Project Limit**: Project cost and requested loan must fit within the specific scheme limits (e.g. ₹1.4 Lakhs for Micro Finance, ₹5 Lakhs for Udyam Nidhi, ₹50 Lakhs for Term Loan)."
        return {
            "reply": reply,
            "grounded_sources": sources,
            "retrieved_context": db_context,
            "lang": lang
        }

    # How to apply / loan process
    if any(k in msg_lower for k in ["apply", "application", "how to", "process", "procedure"]):
        if lang == "hi":
            reply = "NSFDC ऋण के लिए आवेदन करने की प्रक्रिया:\n1. अपनी पात्रता की जाँच उद्यमसारथी 'Check Eligibility' पृष्ठ पर करें।\n2. उपयुक्त योजना (जैसे MFS, UNY, या Term Loan) चुनें।\n3. अधिकृत राज्य चैनलाइजिंग एजेंसी (SCA) या पार्टनर बैंक (PSB/RRB) की निकटतम शाखा खोजें।\n4. आवश्यक दस्तावेज़ (जाति प्रमाण पत्र, आय प्रमाण पत्र, व्यवसाय योजना, आधार) प्रस्तुत करें।"
        else:
            reply = "How to Apply for NSFDC Schemes:\n\n1. **Check Eligibility**: Use our UdyamSaarthi eligibility tool to verify your scheme options.\n2. **Select Scheme**: Choose from Micro Finance (MFS), Udyam Nidhi (UNY), or Term Loan based on your project cost.\n3. **Locate Channel Partner**: Find your nearest State Channelizing Agency (SCA), Public Sector Bank (PSB), or Regional Rural Bank (RRB) via our Channel Partner Locator.\n4. **Submit Application**: Submit your project proposal along with your SC Caste Certificate, Income Certificate, and Identity Proof to the channel partner."
        return {
            "reply": reply,
            "grounded_sources": sources,
            "retrieved_context": db_context,
            "lang": lang
        }

    # Answer scheme specific queries
    if "term" in msg_lower:
        reply = "Term Loan Scheme funds business projects up to ₹50 Lakhs. Maximum loan is ₹45 Lakhs (up to 90% of project cost) at 8.0% p.a. interest rate for 7 years repayment with a 6-month moratorium grace period through State Channelizing Agencies (SCAs)."
    elif "udyam" in msg_lower or "uny" in msg_lower:
        reply = "Udyam Nidhi Yojana (UNY) supports small enterprise activities up to ₹5 Lakhs project cost with a maximum loan of ₹4.5 Lakhs at 13%-15% p.a. interest rate over a 5-year tenure with a 3-month moratorium grace period."
    elif "micro" in msg_lower or "mfs" in msg_lower or "amy" in msg_lower:
        reply = "Micro Finance Scheme (MFS) provides loans up to ₹1,25,000 at 6.5% p.a. interest for projects up to ₹1,40,000 over 3 years with a 3-month moratorium grace period."
    elif "education" in msg_lower or "els" in msg_lower or "study" in msg_lower:
        reply = "Educational Loan Scheme (ELS) provides loans up to ₹40 Lakhs (or 90% of fee) for professional/technical education at 6.5% p.a. interest rate with repayment tenure of 10-12 years and a moratorium of Course Duration + 1 Year."
    elif "document" in msg_lower or "paper" in msg_lower:
        reply = "Key documents required for NSFDC loan applications:\n1. SC Caste Certificate\n2. Income Certificate (Family Income ≤ ₹5 Lakhs)\n3. Detailed Project Report / Business Proposal / Fee Structure\n4. Identity Proof (Aadhaar / Voter ID / PAN Card)\n5. Bank Account Details & Address Proof"
    elif "npa" in msg_lower or "overdue" in msg_lower:
        reply = "Live financial metrics (NPA percentages and overdue amounts) for channel partners are not publicly verified in our reference dataset. Partner institutions cannot be ranked by NPA metrics."
    elif "france" in msg_lower or "capital" in msg_lower:
        reply = "The capital of France is Paris. (Feel free to ask any questions about NSFDC financial schemes, loan limits, or eligibility!)"
    else:
        reply = f"Thank you for your question regarding '{message}'. NSFDC offers 5 primary schemes: Micro Finance Scheme (MFS up to ₹1.4L cost), Udyam Nidhi Yojana (UNY up to ₹5L cost), Term Loan (up to ₹50L cost), Aajeevika Micro-Finance Yojana (AMY), and Educational Loan Scheme (ELS). All schemes require Scheduled Caste (SC) status and annual family income ≤ ₹5,00,000."

    return {
        "reply": reply,
        "grounded_sources": sources,
        "retrieved_context": db_context,
        "lang": lang
    }
