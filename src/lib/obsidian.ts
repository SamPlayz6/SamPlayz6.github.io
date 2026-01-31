/**
 * Obsidian vault reader via GitHub API.
 * Port of backend/obsidian_reader.py to TypeScript.
 */

import matter from 'gray-matter'

const DAYS_TO_LOOK_BACK = 14

interface GitHubTreeItem {
  path: string
  mode: string
  type: string
  sha: string
  size?: number
  url: string
}

interface NoteData {
  path: string
  filename: string
  content: string
  frontmatter: Record<string, unknown>
  modified: string
  entryDate?: string
  isJournal: boolean
  isArea: boolean
  source: 'journal' | 'area' | 'notes'
  extractedTags?: string[]
  extractedPeople?: string[]
  category?: string | null
}

interface MoodAnalysis {
  mood: 'energized' | 'stressed' | 'balanced'
  moodScore: number
  positiveSignals: number
  stressSignals: number
  balanceSignals: number
}

interface NotesSummary {
  totalNotes: number
  journalEntries: number
  otherNotes: number
  notes: NoteData[]
  byCategory: Record<string, NoteData[]>
  allPeople: string[]
  allTags: string[]
  moodAnalysis: MoodAnalysis | null
}

async function githubFetch(url: string): Promise<Response> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) {
    headers.Authorization = `token ${token}`
  }
  return fetch(url, { headers })
}

/**
 * Get the full file tree of the vault repo.
 */
async function getVaultTree(): Promise<GitHubTreeItem[]> {
  const repo = process.env.VAULT_REPO
  if (!repo) {
    console.error('VAULT_REPO not set')
    return []
  }

  const res = await githubFetch(
    `https://api.github.com/repos/${repo}/git/trees/main?recursive=1`
  )

  if (!res.ok) {
    console.error(`Failed to fetch vault tree: ${res.status} ${res.statusText}`)
    return []
  }

  const data = await res.json()
  return (data.tree || []).filter(
    (item: GitHubTreeItem) => item.type === 'blob' && item.path.endsWith('.md')
  )
}

/**
 * Fetch the content of a single file from the vault.
 */
async function fetchFileContent(path: string): Promise<string | null> {
  const repo = process.env.VAULT_REPO
  if (!repo) return null

  const res = await githubFetch(
    `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`
  )

  if (!res.ok) return null

  const data = await res.json()
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8')
  }
  return null
}

/**
 * Get the latest commit date for a file.
 */
async function getFileCommitDate(path: string): Promise<string | null> {
  const repo = process.env.VAULT_REPO
  if (!repo) return null

  const res = await githubFetch(
    `https://api.github.com/repos/${repo}/commits?path=${encodeURIComponent(path)}&per_page=1`
  )

  if (!res.ok) return null

  const commits = await res.json()
  if (commits.length > 0) {
    return commits[0].commit.committer.date
  }
  return null
}

/**
 * Parse a journal filename to extract date (YYYY-MM-DD.md format).
 */
function parseDateFromFilename(filename: string): string | null {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})\.md$/)
  if (match) {
    return match[1]
  }
  return null
}

/**
 * Extract tags from a note (from frontmatter and inline #tags).
 */
export function extractTags(note: NoteData): string[] {
  const tags: string[] = []

  // From frontmatter
  const fmTags = note.frontmatter?.tags
  if (Array.isArray(fmTags)) {
    tags.push(...fmTags.map(String))
  } else if (typeof fmTags === 'string') {
    tags.push(fmTags)
  }

  // From inline tags
  const inlineTags = note.content.match(/#(\w+)/g)
  if (inlineTags) {
    tags.push(...inlineTags.map((t) => t.slice(1)))
  }

  return [...new Set(tags.map((t) => t.toLowerCase()))]
}

/**
 * Extract people mentions from note content.
 * Looks for @Name, [[Name]] links, and known patterns.
 */
export function extractPeople(content: string): string[] {
  const people: string[] = []

  // @mentions
  const atMentions = content.match(/@(\w+)/g)
  if (atMentions) {
    people.push(...atMentions.map((m) => m.slice(1)))
  }

  // [[Wikilinks]] that look like names
  const wikilinks = content.match(/\[\[([^\]]+)\]\]/g)
  if (wikilinks) {
    for (const link of wikilinks) {
      const name = link.slice(2, -2)
      const words = name.split(' ')
      if (words.length >= 1 && words.length <= 3 && words.every((w) => w[0] === w[0].toUpperCase())) {
        people.push(name)
      }
    }
  }

  // Known people patterns
  const knownPatterns = [
    /\b(Ula|Ulka)\b/g,
    /\b(Damien|Eamon|Marco|James|Micheal|Tom|Kay|Ruth|Killian|Jayden)\b/g,
    /\b(Sam O'Neill)\b/g,
  ]
  for (const pattern of knownPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      people.push(...matches)
    }
  }

  return [...new Set(people)]
}

/**
 * Categorize a note into a quadrant based on content keywords.
 */
export function categorizeNote(note: NoteData): string | null {
  const content = note.content.toLowerCase()
  const filename = note.filename.toLowerCase()

  const quadrantKeywords: Record<string, string[]> = {
    work: [
      'startup', 'maupka', 'ignite', 'company', 'business', 'pilot',
      'customers', 'product', 'building', 'coding', 'enterprise',
      'funding', 'grant', 'revenue', 'marketing', 'sales', 'investor',
      'tyndall', 'research', 'argyou', 'edtech', 'teacher', 'student',
    ],
    parkour: [
      'parkour', 'training', 'vaults', 'kong', 'handspring', 'movement',
      'exercise', 'workout', 'calisthenics', 'fitness', 'dive roll',
      'turn vault', 'helicoptero', 'planche', 'pullup', 'pistol squat',
    ],
    relationships: [
      'ula', 'ulka', 'friends', 'family', 'social', 'lunch with',
      'meeting with', 'talked to', 'couple', 'relationship',
    ],
    travel: [
      'japan', 'japanese', 'tokyo', 'mext', 'travel', 'trip',
      'abroad', 'language learning', 'n2', 'n3', 'anki', 'japanese language',
    ],
  }

  const scores: Record<string, number> = { work: 0, parkour: 0, relationships: 0, travel: 0 }

  for (const [quadrant, keywords] of Object.entries(quadrantKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword) || filename.includes(keyword)) {
        scores[quadrant]++
      }
    }
  }

  const maxQuadrant = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))
  if (maxQuadrant[1] >= 2) {
    return maxQuadrant[0]
  }

  return null
}

/**
 * Analyze mood from journal content.
 */
export function analyzeMoodFromJournal(content: string): MoodAnalysis {
  const lower = content.toLowerCase()

  const positiveWords = [
    'excited', 'great', 'amazing', 'happy', 'good', 'fantastic',
    'love', 'awesome', 'wonderful', 'progress', 'success', 'achieved',
    'fun', 'enjoying', 'productive',
  ]

  const stressWords = [
    'worried', 'stressed', 'anxious', 'overwhelmed', 'tired',
    'frustrated', 'stuck', 'difficult', 'hard', 'problem',
    'behind', 'overdoing', 'burned', 'struggle',
  ]

  const balanceWords = [
    'balance', 'rest', 'chill', 'relax', 'break', 'free time',
    'living', 'enjoying life',
  ]

  const positiveCount = positiveWords.filter((w) => lower.includes(w)).length
  const stressCount = stressWords.filter((w) => lower.includes(w)).length
  const balanceCount = balanceWords.filter((w) => lower.includes(w)).length

  const total = positiveCount + stressCount + 1
  const moodScore = (positiveCount - stressCount) / total

  let mood: MoodAnalysis['mood']
  if (moodScore > 0.3) mood = 'energized'
  else if (moodScore < -0.3) mood = 'stressed'
  else mood = 'balanced'

  return {
    mood,
    moodScore: Math.round(moodScore * 100) / 100,
    positiveSignals: positiveCount,
    stressSignals: stressCount,
    balanceSignals: balanceCount,
  }
}

/**
 * Get a summary of recent notes from the vault via GitHub API.
 */
export async function getNotesSummary(days: number = DAYS_TO_LOOK_BACK): Promise<NotesSummary> {
  const tree = await getVaultTree()

  if (tree.length === 0) {
    return {
      totalNotes: 0,
      journalEntries: 0,
      otherNotes: 0,
      notes: [],
      byCategory: {},
      allPeople: [],
      allTags: [],
      moodAnalysis: null,
    }
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const journalNotes: NoteData[] = []
  const otherNotes: NoteData[] = []

  // Process files - limit to avoid API rate limits
  const filesToProcess = tree.slice(0, 100)

  for (const file of filesToProcess) {
    const isJournal = file.path.startsWith('_Journal/')
    const isArea = file.path.startsWith('_Areas/')
    const filename = file.path.split('/').pop() || file.path

    // For journal files, try to parse date from filename
    let entryDate: string | null = null
    if (isJournal) {
      entryDate = parseDateFromFilename(filename)
    }

    // Get file modification date from commits
    const commitDate = await getFileCommitDate(file.path)
    const modified = commitDate || new Date().toISOString()

    // Check if file is recent enough
    const fileDate = entryDate ? new Date(entryDate) : new Date(modified)
    if (fileDate < cutoffDate && new Date(modified) < cutoffDate) {
      continue
    }

    // Fetch content
    const rawContent = await fetchFileContent(file.path)
    if (!rawContent) continue

    // Parse frontmatter
    const { data: frontmatter, content } = matter(rawContent)

    const note: NoteData = {
      path: file.path,
      filename,
      content,
      frontmatter,
      modified,
      entryDate: entryDate || undefined,
      isJournal,
      isArea,
      source: isJournal ? 'journal' : isArea ? 'area' : 'notes',
    }

    if (isJournal) {
      journalNotes.push(note)
    } else {
      otherNotes.push(note)
    }
  }

  // Sort journals by entry date
  journalNotes.sort((a, b) => {
    const dateA = a.entryDate || a.modified
    const dateB = b.entryDate || b.modified
    return dateB.localeCompare(dateA)
  })

  const allNotes = [...journalNotes, ...otherNotes]

  const allPeople: string[] = []
  const allTags: string[] = []
  const byCategory: Record<string, NoteData[]> = {
    relationships: [],
    parkour: [],
    work: [],
    travel: [],
    uncategorized: [],
  }

  // Analyze mood from recent journals
  let moodAnalysis: MoodAnalysis | null = null
  if (journalNotes.length > 0) {
    const combinedContent = journalNotes
      .slice(0, 5)
      .map((j) => j.content)
      .join('\n')
    moodAnalysis = analyzeMoodFromJournal(combinedContent)
  }

  for (const note of allNotes) {
    const tags = extractTags(note)
    const people = extractPeople(note.content)
    const category = categorizeNote(note)

    note.extractedTags = tags
    note.extractedPeople = people
    note.category = category

    allTags.push(...tags)
    allPeople.push(...people)

    if (category) {
      byCategory[category].push(note)
    } else {
      byCategory.uncategorized.push(note)
    }
  }

  return {
    totalNotes: allNotes.length,
    journalEntries: journalNotes.length,
    otherNotes: otherNotes.length,
    notes: allNotes,
    byCategory,
    allPeople: [...new Set(allPeople)],
    allTags: [...new Set(allTags)],
    moodAnalysis,
  }
}
