"""
Prompt builder for summarization.
"""

class SummarizePrompt:
    @staticmethod
    def build(content: str, style: str) -> str:
        """
        Build summarization prompt for AI provider.

        Args:
            content: text to summarize
            style: 'brief', 'detailed', or 'bullet-points'

        Returns:
            str: prompt string
        """
        return f"Summarize the following content in {style} style:\n{content}"
