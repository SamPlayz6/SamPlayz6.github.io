import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyItem = any

export async function GET() {
  try {
    const items = await prisma.inspirationItem.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      items.map((i: AnyItem) => ({
        id: i.id,
        category: i.category,
        type: i.type,
        title: i.title,
        content: i.content,
        source: i.source,
        personName: i.personName,
        addedAt: i.addedAt,
        tags: i.tags,
      }))
    )
  } catch (error) {
    console.error('Error fetching inspiration:', error)
    return NextResponse.json({ error: 'Failed to fetch inspiration' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, category, type, source, personName, tags } = await request.json()

    if (!title || !content || !category || !type) {
      return NextResponse.json(
        { error: 'Title, content, category, and type are required' },
        { status: 400 }
      )
    }

    const id = `insp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const item = await prisma.inspirationItem.create({
      data: {
        id,
        title,
        content,
        category,
        type,
        source: source || null,
        personName: personName || null,
        addedAt: new Date().toISOString().split('T')[0],
        tags: tags || [],
      },
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Error creating inspiration item:', error)
    return NextResponse.json({ error: 'Failed to create inspiration item' }, { status: 500 })
  }
}
