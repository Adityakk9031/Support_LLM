from .models import Ticket


def build_classify_prompt(description: str) -> str:
    categories = ', '.join([c.value for c in Ticket.Category])
    priorities = ', '.join([p.value for p in Ticket.Priority])
    return (
        "You are a support ticket triage assistant.\n"
        "Given the user description, choose exactly one category and one priority.\n"
        f"Allowed categories: {categories}.\n"
        f"Allowed priorities: {priorities}.\n"
        "If uncertain, choose category=general and priority=medium.\n"
        "Return ONLY a JSON object with keys 'category' and 'priority'.\n"
        "Description:\n"
        f"{description}\n"
    )