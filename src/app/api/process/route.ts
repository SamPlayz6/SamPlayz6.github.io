import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getNotesSummary } from '@/lib/obsidian'
import { getGitHubSummary } from '@/lib/github'
import { getCalendarEvents, formatCalendarForPrompt } from '@/lib/calendar'
import { analyzeLifeData, validateAnalysis } from '@/lib/analyzer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = any

const DAYS_TO_LOOK_BACK = 14

/**
 * Authenticate via session cookie (middleware handles this for /api/process)
 * or via cron secret header for scheduled runs.
 */
function verifyCronAuth(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: Request) {
  // For cron jobs, verify the secret (middleware already handles session auth)
  const isCron = request.headers.get('x-vercel-cron') === '1'
  if (isCron && !verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Step 1: Gather data
    console.log('[process] Step 1: Gathering data...')
    const [notesSummary, githubSummary, calendarSummary] = await Promise.all([
      getNotesSummary(DAYS_TO_LOOK_BACK),
      getGitHubSummary(),
      getCalendarEvents(7, 14),
    ])

    const calendarText = calendarSummary
      ? formatCalendarForPrompt(calendarSummary)
      : 'No calendar data available.'

    console.log(`[process] Notes: ${notesSummary.notes?.length || 0}, GitHub commits: ${githubSummary.commits}, Calendar: ${calendarSummary ? 'loaded' : 'none'}`)

    // Get manual entries
    const manualEntries = await prisma.manualEntry.findMany({
      where: { processed: false },
    })

    // Get current quadrants
    const quadrantRows = await prisma.quadrant.findMany()
    const currentQuadrants: Record<string, { name: string; status: string }> = {}
    for (const q of quadrantRows as AnyRecord[]) {
      currentQuadrants[q.category] = { name: q.name, status: q.status }
    }

    // Step 2: Analyze with Claude
    console.log('[process] Step 2: Calling Claude API...')
    const analysis = await analyzeLifeData(
      notesSummary,
      githubSummary,
      manualEntries.map((e: AnyRecord) => ({
        category: e.category,
        content: e.content,
        processed: e.processed,
      })),
      currentQuadrants,
      DAYS_TO_LOOK_BACK,
      calendarText
    )

    if (!analysis) {
      console.error('[process] Claude analysis returned null')
      return NextResponse.json({ success: false, error: 'Analysis failed - check ANTHROPIC_API_KEY and logs' }, { status: 500 })
    }

    console.log('[process] Step 3: Updating database...')

    if (!validateAnalysis(analysis)) {
      return NextResponse.json(
        { success: false, error: 'Analysis validation failed' },
        { status: 500 }
      )
    }

    // Step 3: Update database

    // Add timeline entries
    const timelineEntries = analysis.timeline_entries || []
    for (const entry of timelineEntries) {
      await prisma.timelineEntry.upsert({
        where: { id: entry.id },
        update: {
          date: entry.date,
          category: entry.category,
          title: entry.title,
          content: entry.content,
          significance: entry.significance,
        },
        create: {
          id: entry.id,
          date: entry.date,
          category: entry.category,
          title: entry.title,
          content: entry.content,
          significance: entry.significance,
        },
      })
    }

    // Update quadrants
    const quadrantUpdates = analysis.quadrant_updates || {}
    for (const [category, updates] of Object.entries(quadrantUpdates)) {
      const existing = (quadrantRows as AnyRecord[]).find((q) => q.category === category)
      if (existing) {
        await prisma.quadrant.update({
          where: { category },
          data: {
            status: updates.status,
            lastActivity: updates.lastActivity || existing.lastActivity,
            activityPulse: updates.activityPulse ?? existing.activityPulse,
            metrics: (updates.metrics as object) || existing.metrics,
          },
        })
      }
    }

    // Create new RightNow snapshot
    const rightNow = analysis.right_now
    const now = new Date()
    const { summary, valuesAlignment, actionables, celebration, friendlyNote, ...extraRightNow } =
      rightNow

    await prisma.rightNowSnapshot.create({
      data: {
        weekOf: now.toISOString().split('T')[0],
        lastUpdated: now.toISOString(),
        quadrantStatuses: Object.fromEntries(
          Object.entries(quadrantUpdates).map(([k, v]) => [k, v.status])
        ),
        summary,
        valuesAlignment: valuesAlignment as object,
        actionables: actionables as object[],
        celebration,
        friendlyNote,
        extraData: Object.keys(extraRightNow).length > 0 ? (extraRightNow as object) : null,
      },
    })

    // Process extracted goals
    const extractedGoals = analysis.extracted_goals || []
    for (const goal of extractedGoals) {
      await prisma.goal.upsert({
        where: { id: goal.id },
        update: {
          text: goal.text,
          category: goal.category || null,
          progress: goal.progress || null,
        },
        create: {
          id: goal.id,
          text: goal.text,
          category: goal.category || null,
          timeframe: goal.timeframe || 'near',
          progress: goal.progress || null,
        },
      })
    }

    // Process extracted inspiration
    const extractedInspiration = analysis.extracted_inspiration || []
    for (const item of extractedInspiration) {
      await prisma.inspirationItem.upsert({
        where: { id: item.id },
        update: {
          title: item.title,
          content: item.content,
        },
        create: {
          id: item.id,
          category: item.category,
          type: item.type,
          title: item.title,
          content: item.content,
          source: item.source || null,
          addedAt: now.toISOString().split('T')[0],
        },
      })
    }

    // Mark manual entries as processed
    if (manualEntries.length > 0) {
      await prisma.manualEntry.updateMany({
        where: { id: { in: manualEntries.map((e: AnyRecord) => e.id) } },
        data: { processed: true },
      })
    }

    // Update metadata
    await prisma.processingMetadata.upsert({
      where: { id: 'singleton' },
      update: {
        lastProcessed: now.toISOString(),
        totalEntriesProcessed: { increment: timelineEntries.length },
      },
      create: {
        id: 'singleton',
        lastProcessed: now.toISOString(),
        totalEntriesProcessed: timelineEntries.length,
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        timelineEntries: timelineEntries.length,
        goalsExtracted: extractedGoals.length,
        inspirationExtracted: extractedInspiration.length,
        manualEntriesProcessed: manualEntries.length,
      },
    })
  } catch (error) {
    const err = error as Error
    console.error('Processing error:', err.message, err.stack)
    return NextResponse.json(
      { success: false, error: err.message || 'Processing failed' },
      { status: 500 }
    )
  }
}

// Also support GET for Vercel cron
export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Forward to POST handler
  return POST(request)
}
