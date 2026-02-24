import pytest
from httpx import AsyncClient
from unittest.mock import MagicMock, patch
import io

@pytest.mark.anyio
async def test_upload_invalid_file_type(client: AsyncClient):
    """
    Ensure only PDF files are accepted.
    """
    files = {"file": ("test.txt", b"some text content", "text/plain")}
    response = await client.post("/api/v1/extraction/upload", files=files)
    
    assert response.status_code == 400
    assert "Only PDF files are supported" in response.json()["detail"]

@pytest.mark.anyio
async def test_health_check(client: AsyncClient):
    """
    Standard health check test.
    """
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.anyio
async def test_successful_pdf_upload(client: AsyncClient):
    """
    Test successful PDF upload and extraction with mocked pdfplumber.
    """
    # Mocking pdfplumber.open
    mock_pdf = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Extracted test content"
    mock_pdf.pages = [mock_page]
    mock_pdf.__enter__.return_value = mock_pdf
    
    with patch("pdfplumber.open", return_value=mock_pdf):
        # Create a dummy PDF content
        dummy_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Title (Test Document)\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF"
        files = {"file": ("study_guide.pdf", dummy_pdf_content, "application/pdf")}
        
        response = await client.post("/api/v1/extraction/upload", files=files)
        
        assert response.status_code == 200
        json_data = response.json()
        assert json_data["success"] is True
        assert json_data["data"]["filename"] == "study_guide.pdf"
        assert json_data["data"]["text"] == "Extracted test content"
        assert json_data["data"]["metadata"]["page_count"] == 1
