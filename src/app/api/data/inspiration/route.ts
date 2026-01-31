import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.inspirationItem.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      items.map((i) => ({
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
