"""Prompts for Claude analysis."""

from config import YOUR_VALUES, QUADRANTS

ANALYSIS_SYSTEM_PROMPT = """You are a supportive life companion AI helping Sam analyze his life patterns and progress. You have access to his recent notes, GitHub activity, and manual entries.

Your role is to:
1. Analyze the content and extract meaningful moments for each life quadrant
2. Identify patterns, achievements, and areas needing attention
3. Provide supportive, encouraging feedback (like a wise friend, not a productivity app)
4. Extract goals, people, and inspiration items mentioned

Sam's core values are:
{values}

The four life quadrants are:
{quadrants}

Be warm, supportive, and focus on story over stats. Celebrate wins, gently notice drift, never guilt-trip.
"""

ANALYSIS_USER_PROMPT = """Please analyze the following data from the past {days} days and provide a structured JSON response.

## Recent Obsidian Notes:
{notes}

## GitHub Activity:
{github}

## Manual Entries:
{manual_entries}

## Current Quadrant Status:
{current_quadrants}

---

Please respond with a JSON object containing:

1. "timeline_entries": Array of new timeline entries to add, each with:
   - id: unique string (use format "tl-{timestamp}-{index}")
   - date: ISO date string
   - category: one of "relationships", "parkour", "work", "travel"
   - title: short descriptive title
   - content: 1-2 sentence description
   - significance: "minor", "notable", or "major"
   - sourceNote: optional reference to source note

2. "quadrant_updates": Object with updates for each quadrant:
   - status: "thriving", "needs_attention", or "neglected"
   - lastActivity: ISO date of most recent activity
   - activityPulse: boolean (true if high recent activity)
   - metrics: object with relevant metrics
   - people: array for relationships (name, mentionCount, connectionQuality)
   - skills: array for parkour (name, status)
   - githubStats: object for work (commits, repos, streak)
   - travelStats: object for travel (daysSinceLastTrip, etc.)

3. "right_now": Current state snapshot:
   - summary: 2-3 sentence overview
   - valuesAlignment: object with score (0-100), livingWell array, needsAttention array, note
   - actionables: array of 2-3 suggestions with id, text, priority, effort, impact, quadrant
   - celebration: highlight one win (even small ones)
   - friendlyNote: warm, supportive message

4. "extracted_goals": Array of goals mentioned, each with:
   - id: unique string
   - text: the goal
   - category: quadrant category if applicable
   - timeframe: "near" or "far"

5. "extracted_inspiration": Array of inspiration items mentioned:
   - id: unique string
   - category: "movement", "innovation", "travel", "philosophy", or "people"
   - type: "video", "image", "quote", "article", or "profile"
   - title: descriptive title
   - content: URL or quote text
   - source: where it came from

Respond ONLY with valid JSON, no explanation text.
"""


def get_system_prompt() -> str:
    """Get the system prompt with values and quadrants filled in."""
    values_str = "\n".join(f"- {v}" for v in YOUR_VALUES)
    quadrants_str = "\n".join(
        f"- {q['name']}: {', '.join(q['tags'])}"
        for q in QUADRANTS.values()
    )
    return ANALYSIS_SYSTEM_PROMPT.format(values=values_str, quadrants=quadrants_str)


def get_user_prompt(
    notes_summary: dict,
    github_summary: dict,
    manual_entries: list,
    current_quadrants: dict,
    days: int = 14
) -> str:
    """Build the user prompt with all the data."""

    # Format notes
    notes_text = ""
    for note in notes_summary.get('notes', [])[:20]:  # Limit to 20 most recent
        notes_text += f"\n### {note['filename']} ({note['modified']})\n"
        notes_text += f"Tags: {', '.join(note.get('extracted_tags', []))}\n"
        notes_text += f"Category: {note.get('category', 'uncategorized')}\n"
        notes_text += f"Content preview:\n{note['content'][:500]}...\n"

    if not notes_text:
        notes_text = "No recent notes found."

    # Format GitHub
    github_text = f"""
Commits: {github_summary.get('commits', 0)}
Active repos: {', '.join(github_summary.get('repos', []))}
Current streak: {github_summary.get('streak', 0)} days
Recent commit messages: {', '.join(github_summary.get('recent_messages', [])[:5])}
"""

    # Format manual entries
    manual_text = ""
    for entry in manual_entries:
        if not entry.get('processed', False):
            manual_text += f"\n- [{entry['category']}] {entry['content']}"

    if not manual_text:
        manual_text = "No pending manual entries."

    # Format current quadrants
    quadrants_text = ""
    for key, q in current_quadrants.items():
        quadrants_text += f"\n- {q.get('name', key)}: {q.get('status', 'unknown')}"

    return ANALYSIS_USER_PROMPT.format(
        days=days,
        notes=notes_text,
        github=github_text,
        manual_entries=manual_text,
        current_quadrants=quadrants_text,
    )
