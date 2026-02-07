"""
Service layer for AI-powered summarization, quiz generation, and diagrams.
"""

from app.prompts.summarize_prompt import SummarizePrompt
from app.prompts.quiz_prompt import QuizPrompt
from app.prompts.diagram_prompt import DiagramPrompt


class AIService:
    """
    AI service using a provider (e.g., Gemini API) for all endpoints.
    """

    def __init__(self, provider):
        self.provider = provider

    async def summarize(self, content: str, style: str):
        """Build prompt and request summary from AI provider."""
        prompt = SummarizePrompt.build(content, style)
        return await self.provider.generate_text(prompt)

    async def quiz(self, content: str, count: int, difficulty: str):
        """Build prompt and request quiz from AI provider."""
        prompt = QuizPrompt.build(content, count, difficulty)
        return await self.provider.generate_text(prompt)

    async def diagram(self, content: str, diagram_type: str):
        """Build prompt and request diagram from AI provider."""
        prompt = DiagramPrompt.build(content, diagram_type)
        return await self.provider.generate_image(prompt)
