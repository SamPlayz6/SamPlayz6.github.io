import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEntry = any

export async function GET() {
  try {
    const entries = await prisma.timelineEntry.findMany({
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(
      entries.map((e: AnyEntry) => ({
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

export async function POST(request: Request) {
  try {
    const { title, content, category, date, significance, imageUrl } = await request.json()

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    const id = `tl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const entry = await prisma.timelineEntry.create({
      data: {
        id,
        title,
        content,
        category,
        date: date || new Date().toISOString().split('T')[0],
        significance: significance || 'notable',
        imageUrl: imageUrl || null,
        sourceNote: 'manual',
      },
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('Error creating timeline entry:', error)
    return NextResponse.json({ error: 'Failed to create timeline entry' }, { status: 500 })
  }
}
