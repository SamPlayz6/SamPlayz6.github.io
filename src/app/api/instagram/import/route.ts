import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseInstagramExport } from '@/lib/instagram'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON data. Upload your Instagram export JSON.' },
        { status: 400 }
      )
    }

    const items = parseInstagramExport(body)

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No saved or liked posts found in the export data.' },
        { status: 400 }
      )
    }

    // Deduplicate against existing items by checking content
    const existingItems = await prisma.inspirationItem.findMany({
      where: { source: { startsWith: 'Instagram' } },
      select: { content: true },
    })
    const existingContents = new Set(existingItems.map((i) => i.content))

    const newItems = items.filter((item) => !existingContents.has(item.content))

    // Insert new items
    let inserted = 0
    for (const item of newItems) {
      await prisma.inspirationItem.create({
        data: {
          id: item.id,
          category: item.category,
          type: item.type,
          title: item.title,
          content: item.content,
          source: item.source,
          addedAt: item.addedAt,
          tags: item.tags,
        },
      })
      inserted++
    }

    return NextResponse.json({
      success: true,
      stats: {
        parsed: items.length,
        new: inserted,
        duplicates: items.length - inserted,
      },
    })
  } catch (error) {
    console.error('Instagram import error:', error)
    return NextResponse.json(
      { error: 'Failed to process Instagram export' },
      { status: 500 }
    )
  }
}
