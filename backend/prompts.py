"""Prompts for Claude analysis - personalized for Sam's life."""

from config import YOUR_VALUES, QUADRANTS

ANALYSIS_SYSTEM_PROMPT = """You are a supportive life companion AI helping Sam Dunning analyze his life patterns and progress. You know him well through his notes.

## About Sam:
- 23 years old, Irish, based in Cork
- Building Maupka - AI maths tutoring for Irish secondary schools
- Currently in UCC's IGNITE incubator program
- Passionate about parkour, Japanese language, and innovation
- Dreams of living in Japan (MEXT didn't work out, but Working Holiday Visa is an option)
- In a relationship with Ula who supports his entrepreneurial journey
- Values: adaptability, enjoying life, being good to people, movement, building things

## Your role:
1. Analyze content and extract meaningful moments for each life quadrant
2. Identify patterns, achievements, and areas needing attention
3. Provide supportive feedback (like a wise friend, not a productivity app)
4. Be concise - Sam doesn't want to be overwhelmed
5. Bias towards recent content (more relevant)
6. Remember his philosophy: "Give yourself twice the time. Chill is better."

## Sam's core values:
{values}

## The four life quadrants:
{quadrants}

## Balance awareness:
Sam has noted he sometimes overdoes work. Watch for signals like:
- "overdoing it", "working late", "quality depleting"
- Lack of parkour/training entries
- Travel/Japan dreams being neglected

Be warm, celebrate wins, gently notice drift, never guilt-trip. Remember: he wants a life companion, not a productivity slave driver.
"""

ANALYSIS_USER_PROMPT = """Please analyze the following data from the past {days} days and provide a structured JSON response.

## Recent Journal Entries (prioritize these for mood/thoughts):
{journal_entries}

## Recent Obsidian Notes:
{notes}

## GitHub Activity:
{github}

## Manual Entries:
{manual_entries}

## Current Quadrant Status:
{current_quadrants}

## Mood Analysis from Journals:
{mood_analysis}

---

Please respond with a JSON object containing:

1. "timeline_entries": Array of new timeline entries (max 5-7, focus on significant moments):
   - id: unique string (use format "tl-{timestamp}-{index}")
   - date: ISO date string
   - category: one of "relationships", "parkour", "work", "travel"
   - title: short descriptive title (max 50 chars)
   - content: 1-2 sentence description (concise!)
   - significance: "minor", "notable", or "major"

2. "quadrant_updates": Object with updates for each quadrant:
   - status: "thriving", "balanced", "needs_attention", or "dormant"
   - lastActivity: ISO date of most recent activity
   - activityPulse: boolean (true if active in past week)
   - recentHighlight: one-liner about what's happening
   - metrics: object with 2-3 relevant metrics only

3. "right_now": Current state snapshot:
   - summary: 2-3 sentence overview (be concise, not overwhelming)
   - valuesAlignment: object with score (0-100), livingWell array (max 3), needsAttention array (max 2), note
   - actionables: array of 2-4 suggestions with id, text, priority, effort, impact, quadrant
   - celebration: highlight one win (even small ones count!)
   - friendlyNote: warm, supportive message (max 2 sentences, use Sam's own words/values)
   - balanceCheck: object with mood, recommendation (if overworking detected)

4. "extracted_goals": Array of goals mentioned (max 5 near, 5 far):
   - id: unique string
   - text: the goal (concise)
   - category: quadrant category
   - timeframe: "near" or "far"
   - progress: 0-100 if estimable

5. "extracted_inspiration": Array of inspiration items (max 5):
   - id: unique string
   - category: "movement", "innovation", "travel", "philosophy", or "people"
   - type: "video", "quote", "profile", or "idea"
   - title: descriptive title
   - content: the insight/quote/link
   - source: where it came from (note title)

Remember: Be CONCISE. Sam doesn't want to be overwhelmed. Quality over quantity. Bias towards recent content.

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

    # Separate journal entries from other notes
    journal_text = ""
    notes_text = ""

    for note in notes_summary.get('notes', [])[:25]:  # Limit to 25 most recent
        is_journal = note.get('is_journal', False) or note.get('source') == 'journal'

        entry_text = f"\n### {note['filename']} ({note.get('entry_date', note['modified'])})\n"
        entry_text += f"Category: {note.get('category', 'uncategorized')}\n"
        # Truncate content to avoid overwhelming
        content_preview = note['content'][:800] if len(note['content']) > 800 else note['content']
        entry_text += f"Content:\n{content_preview}\n"

        if is_journal:
            journal_text += entry_text
        else:
            notes_text += entry_text

    if not journal_text:
        journal_text = "No recent journal entries found."
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

    # Format mood analysis
    mood = notes_summary.get('mood_analysis', {})
    mood_text = "Not available"
    if mood:
        mood_text = f"""
Current mood: {mood.get('mood', 'unknown')}
Mood score: {mood.get('mood_score', 0)} (-1 to 1 scale)
Positive signals: {mood.get('positive_signals', 0)}
Stress signals: {mood.get('stress_signals', 0)}
Balance mentions: {mood.get('balance_signals', 0)}
"""

    return ANALYSIS_USER_PROMPT.format(
        days=days,
        journal_entries=journal_text,
        notes=notes_text,
        github=github_text,
        manual_entries=manual_text,
        current_quadrants=quadrants_text,
        mood_analysis=mood_text,
    )
