"""Claude API integration for life analysis."""

import json
from anthropic import Anthropic

from config import ANTHROPIC_API_KEY
from prompts import get_system_prompt, get_user_prompt


def analyze_life_data(
    notes_summary: dict,
    github_summary: dict,
    manual_entries: list,
    current_quadrants: dict,
    days: int = 14
) -> dict | None:
    """
    Send data to Claude for analysis and get structured insights.

    Args:
        notes_summary: Summary of Obsidian notes
        github_summary: Summary of GitHub activity
        manual_entries: List of manual entries
        current_quadrants: Current quadrant data
        days: Number of days being analyzed

    Returns:
        dict: Parsed analysis results, or None on error
    """
    if not ANTHROPIC_API_KEY:
        print("Error: ANTHROPIC_API_KEY not set")
        return None

    client = Anthropic(api_key=ANTHROPIC_API_KEY)

    system_prompt = get_system_prompt()
    user_prompt = get_user_prompt(
        notes_summary,
        github_summary,
        manual_entries,
        current_quadrants,
        days
    )

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )

        # Extract the response text
        response_text = message.content[0].text

        # Parse JSON (Claude should return valid JSON)
        # Sometimes Claude adds markdown code blocks, so strip those
        if response_text.startswith('```'):
            response_text = response_text.split('\n', 1)[1]
            if response_text.endswith('```'):
                response_text = response_text.rsplit('\n', 1)[0]

        analysis = json.loads(response_text)
        return analysis

    except json.JSONDecodeError as e:
        print(f"Error parsing Claude response as JSON: {e}")
        print(f"Response was: {response_text[:500]}...")
        return None
    except Exception as e:
        print(f"Error calling Claude API: {e}")
        return None


def validate_analysis(analysis: dict) -> bool:
    """Validate that the analysis has the expected structure."""
    required_keys = [
        'timeline_entries',
        'quadrant_updates',
        'right_now',
    ]

    for key in required_keys:
        if key not in analysis:
            print(f"Missing required key in analysis: {key}")
            return False

    # Validate right_now structure
    right_now = analysis.get('right_now', {})
    right_now_keys = ['summary', 'valuesAlignment', 'actionables', 'celebration', 'friendlyNote']
    for key in right_now_keys:
        if key not in right_now:
            print(f"Missing key in right_now: {key}")
            return False

    return True


if __name__ == '__main__':
    # Test with minimal data
    print("Testing Claude analyzer...")

    test_notes = {'notes': [], 'total_notes': 0}
    test_github = {'commits': 5, 'repos': ['test-repo'], 'streak': 2}
    test_manual = []
    test_quadrants = {
        'relationships': {'name': 'Relationships', 'status': 'thriving'},
        'parkour': {'name': 'Parkour', 'status': 'thriving'},
        'work': {'name': 'Work', 'status': 'needs_attention'},
        'travel': {'name': 'Travel', 'status': 'needs_attention'},
    }

    result = analyze_life_data(test_notes, test_github, test_manual, test_quadrants)

    if result:
        print("Analysis successful!")
        print(f"Timeline entries: {len(result.get('timeline_entries', []))}")
        print(f"Right now summary: {result.get('right_now', {}).get('summary', 'N/A')}")
    else:
        print("Analysis failed.")
