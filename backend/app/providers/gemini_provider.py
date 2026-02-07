"""
Google Gemini API provider wrapper.
Simulates responses for hackathon demo.
Replace with actual SDK calls in production.
"""

class GeminiProvider:
    async def generate_text(self, prompt: str) -> str:
        """Simulate text response from Gemini API."""
        return f"AI Text Response:\n{prompt}"

    async def generate_image(self, prompt: str) -> str:
        """Simulate base64 diagram from Gemini API."""
        return f"data:image/png;base64,{prompt}"
