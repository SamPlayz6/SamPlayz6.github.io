import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getNotesSummary } from '@/lib/obsidian'
import { getGitHubSummary } from '@/lib/github'
import { analyzeLifeData, validateAnalysis } from '@/lib/analyzer'

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
    const [notesSummary, githubSummary] = await Promise.all([
      getNotesSummary(DAYS_TO_LOOK_BACK),
      getGitHubSummary(),
    ])

    // Get manual entries
    const manualEntries = await prisma.manualEntry.findMany({
      where: { processed: false },
    })

    // Get current quadrants
    const quadrantRows = await prisma.quadrant.findMany()
    const currentQuadrants: Record<string, { name: string; status: string }> = {}
    for (const q of quadrantRows) {
      currentQuadrants[q.category] = { name: q.name, status: q.status }
    }

    // Step 2: Analyze with Claude
    const analysis = await analyzeLifeData(
      notesSummary,
      githubSummary,
      manualEntries.map((e) => ({
        category: e.category,
        content: e.content,
        processed: e.processed,
      })),
      currentQuadrants,
      DAYS_TO_LOOK_BACK
    )

    if (!analysis) {
      return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
    }

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
      const existing = quadrantRows.find((q) => q.category === category)
      if (existing) {
        await prisma.quadrant.update({
          where: { category },
          data: {
            status: updates.status,
            lastActivity: updates.lastActivity,
            activityPulse: updates.activityPulse,
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
        extraData: Object.keys(extraRightNow).length > 0 ? (extraRightNow as Prisma.InputJsonValue) : Prisma.DbNull,
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
        where: { id: { in: manualEntries.map((e) => e.id) } },
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
    console.error('Processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Processing failed' },
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
