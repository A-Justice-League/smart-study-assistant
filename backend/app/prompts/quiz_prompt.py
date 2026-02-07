"""
Prompt builder for quiz generation.
"""

class QuizPrompt:
    @staticmethod
    def build(content: str, count: int, difficulty: str) -> str:
        """
        Build quiz generation prompt.

        Args:
            content: text to create quiz from
            count: number of questions
            difficulty: 'easy', 'medium', 'hard'

        Returns:
            str: prompt string
        """
        return f"Generate {count} {difficulty} multiple-choice questions from:\n{content}"
