/**
 * GitHub activity fetcher.
 * Port of backend/github_fetcher.py to TypeScript.
 */

const DAYS_TO_LOOK_BACK = 14

interface GitHubEvent {
  id: string
  type: string
  repo: { name: string }
  created_at: string
  payload: {
    commits?: Array<{ message: string; sha: string }>
    [key: string]: unknown
  }
}

export interface GitHubSummary {
  hasActivity: boolean
  commits: number
  repos: string[]
  streak: number
  recentMessages: string[]
  eventsCount: number
}

async function getGitHubEvents(
  username?: string,
  days: number = DAYS_TO_LOOK_BACK
): Promise<GitHubEvent[]> {
  const user = username || process.env.GITHUB_USERNAME || 'SamPlayz6'
  const token = process.env.GITHUB_TOKEN

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) {
    headers.Authorization = `token ${token}`
  }

  try {
    const res = await fetch(`https://api.github.com/users/${user}/events/public`, { headers })
    if (!res.ok) {
      console.error(`GitHub API error: ${res.status}`)
      return []
    }

    const events: GitHubEvent[] = await res.json()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return events.filter((event) => {
      const eventTime = new Date(event.created_at)
      return eventTime >= cutoff
    })
  } catch (error) {
    console.error('Error fetching GitHub events:', error)
    return []
  }
}

function getCommitCount(events: GitHubEvent[]): number {
  let count = 0
  for (const event of events) {
    if (event.type === 'PushEvent') {
      count += event.payload.commits?.length || 0
    }
  }
  return count
}

function getActiveRepos(events: GitHubEvent[]): string[] {
  const repos = new Set<string>()
  for (const event of events) {
    const repo = event.repo?.name
    if (repo) {
      repos.add(repo.split('/').pop() || repo)
    }
  }
  return [...repos].sort()
}

function getCommitMessages(events: GitHubEvent[], limit: number = 10): string[] {
  const messages: string[] = []
  for (const event of events) {
    if (event.type === 'PushEvent') {
      for (const commit of event.payload.commits || []) {
        messages.push(commit.message)
        if (messages.length >= limit) return messages
      }
    }
  }
  return messages
}

function calculateCodingStreak(events: GitHubEvent[]): number {
  if (!events.length) return 0

  const activityDates = new Set<string>()
  for (const event of events) {
    if (event.type === 'PushEvent') {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      activityDates.add(date)
    }
  }

  if (activityDates.size === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  const current = new Date()

  while (true) {
    const dateStr = current.toISOString().split('T')[0]
    if (activityDates.has(dateStr)) {
      streak++
    } else if (dateStr !== today) {
      break
    }
    current.setDate(current.getDate() - 1)
  }

  return streak
}

export async function getGitHubSummary(): Promise<GitHubSummary> {
  const events = await getGitHubEvents()

  if (!events.length) {
    return {
      hasActivity: false,
      commits: 0,
      repos: [],
      streak: 0,
      recentMessages: [],
      eventsCount: 0,
    }
  }

  return {
    hasActivity: true,
    commits: getCommitCount(events),
    repos: getActiveRepos(events),
    streak: calculateCodingStreak(events),
    recentMessages: getCommitMessages(events),
    eventsCount: events.length,
  }
}
