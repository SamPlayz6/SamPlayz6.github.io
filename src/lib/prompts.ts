/**
 * Prompts for Claude analysis.
 * Port of backend/prompts.py to TypeScript.
 */

const YOUR_VALUES = [
  'Enjoying life',
  'Being good to people',
  'Physical development through movement',
  'Innovation and building things',
  'Travel and new experiences',
  'Learning (especially Japanese)',
]

const QUADRANTS: Record<string, { name: string; tags: string[] }> = {
  relationships: {
    name: 'Relationships',
    tags: ['relationships', 'friends', 'family', 'social', 'connection'],
  },
  parkour: {
    name: 'Parkour',
    tags: ['parkour', 'training', 'movement', 'fitness', 'exercise'],
  },
  work: {
    name: 'Work & Innovation',
    tags: ['work', 'startup', 'coding', 'project', 'ignite', 'development'],
  },
  travel: {
    name: 'Travel & Adventure',
    tags: ['travel', 'trip', 'adventure', 'japan', 'japanese', 'language'],
  },
}

const ANALYSIS_SYSTEM_PROMPT = `You are a supportive life companion AI helping Sam Dunning analyze his life patterns and progress. You know him well through his notes.

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

Be warm, celebrate wins, gently notice drift, never guilt-trip. Remember: he wants a life companion, not a productivity slave driver.`

const ANALYSIS_USER_PROMPT = `Please analyze the following data from the past {days} days and provide a structured JSON response.

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

Respond ONLY with valid JSON, no explanation text.`

export function getSystemPrompt(): string {
  const valuesStr = YOUR_VALUES.map((v) => `- ${v}`).join('\n')
  const quadrantsStr = Object.values(QUADRANTS)
    .map((q) => `- ${q.name}: ${q.tags.join(', ')}`)
    .join('\n')

  return ANALYSIS_SYSTEM_PROMPT
    .replace('{values}', valuesStr)
    .replace('{quadrants}', quadrantsStr)
}

interface NotesSummary {
  notes: Array<{
    filename: string
    content: string
    entryDate?: string
    modified: string
    isJournal: boolean
    source: string
    category?: string | null
  }>
  moodAnalysis: {
    mood: string
    moodScore: number
    positiveSignals: number
    stressSignals: number
    balanceSignals: number
  } | null
}

interface GitHubSummary {
  commits: number
  repos: string[]
  streak: number
  recentMessages: string[]
}

interface ManualEntry {
  category: string
  content: string
  processed?: boolean
}

interface QuadrantData {
  name?: string
  status?: string
  [key: string]: unknown
}

export function getUserPrompt(
  notesSummary: NotesSummary,
  githubSummary: GitHubSummary,
  manualEntries: ManualEntry[],
  currentQuadrants: Record<string, QuadrantData>,
  days: number = 14
): string {
  let journalText = ''
  let notesText = ''

  const recentNotes = (notesSummary.notes || []).slice(0, 25)
  for (const note of recentNotes) {
    const isJournal = note.isJournal || note.source === 'journal'
    const contentPreview = note.content.length > 800 ? note.content.slice(0, 800) : note.content

    const entryText = `\n### ${note.filename} (${note.entryDate || note.modified})\nCategory: ${note.category || 'uncategorized'}\nContent:\n${contentPreview}\n`

    if (isJournal) {
      journalText += entryText
    } else {
      notesText += entryText
    }
  }

  if (!journalText) journalText = 'No recent journal entries found.'
  if (!notesText) notesText = 'No recent notes found.'

  const githubText = `
Commits: ${githubSummary.commits || 0}
Active repos: ${(githubSummary.repos || []).join(', ')}
Current streak: ${githubSummary.streak || 0} days
Recent commit messages: ${(githubSummary.recentMessages || []).slice(0, 5).join(', ')}`

  let manualText = ''
  for (const entry of manualEntries) {
    if (!entry.processed) {
      manualText += `\n- [${entry.category}] ${entry.content}`
    }
  }
  if (!manualText) manualText = 'No pending manual entries.'

  let quadrantsText = ''
  for (const [key, q] of Object.entries(currentQuadrants)) {
    quadrantsText += `\n- ${q.name || key}: ${q.status || 'unknown'}`
  }

  const mood = notesSummary.moodAnalysis
  let moodText = 'Not available'
  if (mood) {
    moodText = `
Current mood: ${mood.mood || 'unknown'}
Mood score: ${mood.moodScore || 0} (-1 to 1 scale)
Positive signals: ${mood.positiveSignals || 0}
Stress signals: ${mood.stressSignals || 0}
Balance mentions: ${mood.balanceSignals || 0}`
  }

  return ANALYSIS_USER_PROMPT
    .replace('{days}', String(days))
    .replace('{journal_entries}', journalText)
    .replace('{notes}', notesText)
    .replace('{github}', githubText)
    .replace('{manual_entries}', manualText)
    .replace('{current_quadrants}', quadrantsText)
    .replace('{mood_analysis}', moodText)
}
