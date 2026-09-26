import pytest
from fastapi.testclient import TestClient
from backend.app import app
client = TestClient(app)
SAMPLE_NDA = """
MUTUAL NON-DISCLOSURE AGREEMENT
This Agreement is entered into on January 1, 2024 by and between Apex Systems Inc. and Horizon Cloud LLC.
1. Confidentiality: Each party shall hold proprietary trade secrets in strict confidence.
2. Limitation of Liability: In no event shall either party's aggregate liability exceed $50,000.
3. Termination: Either party may terminate upon 30 days prior written notice.
4. Governing Law: This agreement is governed by the laws of Delaware.
"""
SAMPLE_HIGH_RISK_CONTRACT = """
VENDOR SERVICES CONTRACT
This Agreement is entered into by and between Enterprise Client Inc and Supplier Corp.
1. Indemnification: Customer shall solely defend, indemnify, and hold harmless Provider from any and all claims.
2. Limitation of Liability: In no event shall Provider's total aggregate liability exceed $0.
3. Termination: Provider may immediately terminate this agreement without notice.
"""
def test_health_telemetry_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    telemetry = data["telemetry"]
    assert "ram_total_gb" in telemetry
    assert telemetry["ram_budget_gb"] == 8.0
    assert telemetry["n_ctx"] == 8192
def test_parse_endpoint():
    response = client.post("/api/v1/parse",data={"raw_text": SAMPLE_NDA})
    assert response.status_code == 200
    data = response.json()
    assert data["word_count"] > 20
    assert "MUTUAL NON-DISCLOSURE AGREEMENT" in data["text"]
def test_chunk_endpoint():
    response = client.post(
        "/api/v1/chunk",
        json={"raw_text": SAMPLE_NDA}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_chunks"] >= 1
def test_analyze_endpoint_structured_json():
    response = client.post(
        "/api/v1/analyze",
        data={"raw_text": SAMPLE_NDA,"document_name": "Apex_Horizon_NDA.txt"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["document_name"] == "Apex_Horizon_NDA.txt"
    assert "stats" in data
    assert data["stats"]["token_count"] > 0
    assert "summary" in data
    assert "executive_summary" in data["summary"]
    assert isinstance(data["summary"]["key_obligations"], list)
    assert "entities" in data
    assert "Delaware" in (data["entities"]["governing_jurisdiction"] or "")
    assert "$50,000" in data["entities"]["monetary_caps"]
    assert "clauses" in data
    assert len(data["clauses"]) >= 2
    assert "risk_analysis" in data
    assert data["risk_analysis"]["overall_risk"] in ["Low", "Medium", "High"]
def test_analyze_endpoint_high_risk_detection():
    response = client.post(
        "/api/v1/analyze",
        data={"raw_text": SAMPLE_HIGH_RISK_CONTRACT,"document_name": "High_Risk_Vendor.txt"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_analysis"]["overall_risk"] == "High"
    assert data["risk_analysis"]["high_risk_count"] >= 1
    assert len(data["risk_analysis"]["critical_flags"]) >= 1
def test_analyze_endpoint_empty_error():
    response = client.post("/api/v1/analyze",data={"raw_text": ""})
    assert response.status_code == 400
