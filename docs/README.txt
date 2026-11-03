SIH26092 — FINAL V6 DATASET

This is the cleaned and audited final dataset package for SIH26092.

Files:
- applicants.csv — 20,000 synthetic applicant records.
- scheme_rules.csv — 5 current primary NSFDC schemes.
- channel_partners.csv — 41 source-backed organization references.
- partner_status.csv — non-fabricated live-status fields.
- validation_report.txt — complete final audit.

Important:
- The literal value "None" in alternate_scheme_option means no alternate scheme; it is not a missing value.
- NSFDC currently states 102 total channel partners. This package intentionally does not fabricate the missing partner identities. It contains 41 source-backed references and distinguishes organization evidence from individual NSFDC authorization.
- Applicant data is synthetic.
- Partner coordinates are city-level estimates, not exact branch GPS.
- Live NPA/overdue/utilization/active-status values are not fabricated.
- Ineligible requested-loan records are retained as negative examples for ML; eligible records satisfy the applicable loan caps used in this dataset.

Validation:
- Final audit uses CSV parsing that preserves literal "None".
- Scheme-name validation uses the canonical names stored in scheme_rules.csv.
- The validation report must show ALL CHECKS PASS: True.

Status:
This is the FINAL V6 package for ML/rule-engine development and SIH prototype integration.
No further version is needed unless official NSFDC rules or partner data materially change.
