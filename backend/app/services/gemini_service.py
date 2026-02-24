import google.generativeai as genai
from app.core.config import settings
from app.core.errors import APIError
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self._configured = False
        self._model_name = "gemini-flash-latest"
        self.model = None

        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._configured = True
            logger.info("GeminiService configured with API key.")
        else:
            logger.warning("GEMINI_API_KEY not set. AI features will return mock data.")

    def _get_model(self):
        """
        Lazy-loads the model only when needed.
        """
        if not self._configured:
            return None
        if not self.model:
            self.model = genai.GenerativeModel(self._model_name)
        return self.model

    async def summarize(self, content: str, style: str) -> dict:
        model = self._get_model()
        if not model:
            # Return mock data if API key missing
            return {
                "summary": "Mock summary: " + content[:50] + "...",
                "key_points": ["Mock Point 1", "Mock Point 2"],
                "topics": ["Mock Topic"],
                "word_count": len(content.split())
            }

        prompt = f"Summarize the following content in '{style}' style:\n\n{content}"
        try:
            response = model.generate_content(prompt)
            return {
                "summary": response.text,
                "key_points": ["Extracted point 1", "Extracted point 2"],
                "topics": ["General"],
                "word_count": len(response.text.split())
            }
        except Exception as e:
            raise APIError(code="AI_ERROR", message=f"Gemini Error: {str(e)}", status_code=500)

    async def generate_quiz(self, content: str, count: int, difficulty: str) -> dict:
        model = self._get_model()
        if not model:
            return {
                "title": "Mock Quiz",
                "questions": [
                    {
                        "id": "q1",
                        "type": "multiple-choice",
                        "question": "What is 2+2?",
                        "options": ["3", "4", "5", "6"],
                        "correct_answer": "4",
                        "explanation": "Math."
                    }
                ],
                "total_questions": 1
            }

        # Replace with real logic when key valid
        return {
            "title": "Generated Quiz",
            "questions": [],
            "total_questions": 0
        }

    async def generate_diagram(self, content: str, diagram_type: str) -> dict:
        model = self._get_model()
        if not model:
            return {
                "title": "Mock Diagram",
                "image_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                "explanation": "A mock red dot diagram."
            }

        # Placeholder for future real implementation
        return {
            "title": "Generated Diagram",
            "image_url": "",
            "explanation": "Logic pending."
        }

# Lazy instantiate: only load model when endpoint calls
gemini_service = GeminiService()