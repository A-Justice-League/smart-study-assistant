from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)

@patch("app.services.gemini_service.gemini_service.summarize", new_callable=AsyncMock)
def test_summarize_mock(mock_summarize):
    mock_summarize.return_value = {
        "summary": "Test Summary",
        "key_points": ["Point 1"],
        "topics": ["Topic A"],
        "word_count": 2
    }
    
    response = client.post("/api/v1/ai/summarize", json={"content": "Test content", "style": "brief"})
    assert response.status_code == 200
    assert response.json()["data"]["summary"] == "Test Summary"

def test_summarize_validation_error():
    # Test missing content
    response = client.post("/api/v1/ai/summarize", json={"style": "brief"})
    assert response.status_code == 422 
