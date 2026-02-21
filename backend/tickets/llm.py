import json
import logging
import os
import re
from typing import Dict

import requests

from .models import Ticket
from .prompts import build_classify_prompt

logger = logging.getLogger(__name__)


def _fallback() -> Dict[str, str]:
    return {
        'category': Ticket.Category.GENERAL,
        'priority': Ticket.Priority.MEDIUM,
    }


def _extract_json(text: str) -> Dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in LLM response")
    return json.loads(match.group(0))


def classify_description(description: str) -> Dict[str, str]:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        logger.warning('GEMINI_API_KEY not set; using fallback')
        return _fallback()

    prompt = build_classify_prompt(description)
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash-lite:generateContent"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 128,
        },
    }

    try:
        resp = requests.post(
            f"{endpoint}?key={api_key}",
            json=payload,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data['candidates'][0]['content']['parts'][0]['text']
        parsed = _extract_json(text)
        category = parsed.get('category') or parsed.get('suggested_category')
        priority = parsed.get('priority') or parsed.get('suggested_priority')
        valid_categories = {c.value for c in Ticket.Category}
        valid_priorities = {p.value for p in Ticket.Priority}
        if category not in valid_categories or priority not in valid_priorities:
            logger.warning('LLM returned invalid values; using fallback')
            return _fallback()
        return {'category': category, 'priority': priority}
    except Exception as exc:
        logger.exception('LLM classify failed: %s', exc)
        return _fallback()