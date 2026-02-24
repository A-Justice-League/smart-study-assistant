import google.generativeai as genai
from app.core.config import settings
from app.core.errors import APIError
import json
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-flash-latest')
            for m in genai.list_models():
                print(m.name, m.supported_generation_methods)
        else:
            logger.warning("GEMINI_API_KEY not set. AI features will return mock data.")
            self.model = None

    async def summarize(self, content: str, style: str) -> dict:
        if not self.model:
             return {
                "summary": "Mock summary: " + content[:50] + "...",
                "key_points": ["Mock Point 1", "Mock Point 2"],
                "topics": ["Mock Topic"],
                "word_count": len(content.split())
             }
        
        prompt = f"Summarize the following content in '{style}' style:\n\n{content}"
        try:
            response = self.model.generate_content(prompt)
            # Simple simulation of structured return
            return {
                "summary": response.text,
                "key_points": ["Extracted point 1", "Extracted point 2"], # Real impl needs structured IO or parsing
                "topics": ["General"],
                "word_count": len(response.text.split())
            }
        except Exception as e:
             raise APIError(code="AI_ERROR", message=f"Gemini Error: {str(e)}", status_code=500)

    async def generate_quiz(self, content: str, count: int, difficulty: str) -> dict:
        if not self.model:
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
        # In real code, enforce JSON mode or parse text
        return {
                "title": "Generated Quiz",
                "questions": [], 
                "total_questions": 0
            }

    async def generate_diagram(self, content: str, diagram_type: str) -> dict:
        if not self.model:
            return {
                "title": "Mock Diagram",
                "image_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                "explanation": "A mock red dot diagram."
            }
        # Logic to get mermaid code or image
        return {
            "title": "Generated Diagram",
             "image_url": "", # Gemini returns text, frontend renders mermaid. Or we generate image.
             # Architecture doc said image_url, but also text. Let's return mock.
             "explanation": "Logic pending."
        }

gemini_service = GeminiService()
