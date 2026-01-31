import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { content, category, imageUrl, link } = await request.json()

    if (!content || !category) {
      return NextResponse.json({ error: 'Content and category are required' }, { status: 400 })
    }

    const validCategories = ['relationships', 'parkour', 'work', 'travel']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const entry = await prisma.manualEntry.create({
      data: {
        content,
        category,
        imageUrl: imageUrl || null,
        link: link || null,
      },
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('Error creating manual entry:', error)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const entries = await prisma.manualEntry.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching manual entries:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}
