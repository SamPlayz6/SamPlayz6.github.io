import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.timelineEntry.findMany({
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(
      entries.map((e) => ({
        id: e.id,
        date: e.date,
        category: e.category,
        title: e.title,
        content: e.content,
        imageUrl: e.imageUrl,
        sourceNote: e.sourceNote,
        significance: e.significance,
      }))
    )
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }
}
