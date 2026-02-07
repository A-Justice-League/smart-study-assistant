"""
Prompt builder for diagram generation.
"""

class DiagramPrompt:
    @staticmethod
    def build(content: str, diagram_type: str) -> str:
        """
        Build diagram generation prompt.

        Args:
            content: text to convert into diagram
            diagram_type: 'flowchart', 'mindmap', 'concept-map'

        Returns:
            str: prompt string
        """
        return f"Create a {diagram_type} diagram from the following content:\n{content}"
