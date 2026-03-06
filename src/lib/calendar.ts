/**
 * Google Calendar integration.
 * Uses a service account to read calendar events.
 */

import { google } from 'googleapis'

interface CalendarEvent {
  title: string
  start: string
  end: string
  calendar: string
  location?: string
  description?: string
  isAllDay: boolean
}

export interface CalendarSummary {
  upcoming: CalendarEvent[]
  recent: CalendarEvent[]
  totalUpcoming: number
  totalRecent: number
  busyDays: string[]
  freeDays: string[]
}

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!credentials) return null

  try {
    const parsed = JSON.parse(credentials)
    return new google.auth.GoogleAuth({
      credentials: parsed,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })
  } catch {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY')
    return null
  }
}

export async function getCalendarEvents(daysBack: number = 7, daysAhead: number = 14): Promise<CalendarSummary | null> {
  const auth = getAuth()
  if (!auth) return null

  const calendarIds = (process.env.GOOGLE_CALENDAR_IDS || 'primary').split(',').map(s => s.trim())

  const calendar = google.calendar({ version: 'v3', auth })

  const now = new Date()
  const pastDate = new Date(now)
  pastDate.setDate(pastDate.getDate() - daysBack)
  const futureDate = new Date(now)
  futureDate.setDate(futureDate.getDate() + daysAhead)

  const allEvents: CalendarEvent[] = []

  for (const calendarId of calendarIds) {
    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin: pastDate.toISOString(),
        timeMax: futureDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
      })

      const events = response.data.items || []
      for (const event of events) {
        if (!event.summary) continue

        const isAllDay = !!event.start?.date
        allEvents.push({
          title: event.summary,
          start: event.start?.dateTime || event.start?.date || '',
          end: event.end?.dateTime || event.end?.date || '',
          calendar: calendarId === 'primary' ? 'Main' : calendarId,
          location: event.location || undefined,
          description: event.description ? event.description.slice(0, 200) : undefined,
          isAllDay,
        })
      }
    } catch (error) {
      console.error(`Failed to fetch calendar ${calendarId}:`, error)
    }
  }

  // Split into recent and upcoming
  const recent = allEvents.filter(e => new Date(e.start) < now).reverse()
  const upcoming = allEvents.filter(e => new Date(e.start) >= now)

  // Find busy and free days in next 7 days
  const next7Days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    next7Days.push(d.toISOString().split('T')[0])
  }

  const busyDays = new Set<string>()
  for (const event of upcoming) {
    const day = new Date(event.start).toISOString().split('T')[0]
    if (next7Days.includes(day)) busyDays.add(day)
  }
  const freeDays = next7Days.filter(d => !busyDays.has(d))

  return {
    upcoming: upcoming.slice(0, 20),
    recent: recent.slice(0, 15),
    totalUpcoming: upcoming.length,
    totalRecent: recent.length,
    busyDays: Array.from(busyDays),
    freeDays,
  }
}

export function formatCalendarForPrompt(summary: CalendarSummary): string {
  let text = ''

  if (summary.recent.length > 0) {
    text += '\n### Recent Events:\n'
    for (const event of summary.recent) {
      const date = new Date(event.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      text += `- ${date}: ${event.title}${event.location ? ` (${event.location})` : ''}\n`
    }
  }

  if (summary.upcoming.length > 0) {
    text += '\n### Upcoming Events:\n'
    for (const event of summary.upcoming) {
      const date = new Date(event.start).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
      const time = event.isAllDay ? 'all day' : new Date(event.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      text += `- ${date} ${time}: ${event.title}${event.location ? ` (${event.location})` : ''}\n`
    }
  }

  if (summary.freeDays.length > 0) {
    const freeFormatted = summary.freeDays.map(d =>
      new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    )
    text += `\nFree days this week: ${freeFormatted.join(', ')}\n`
  }

  return text || 'No calendar data available.'
}
