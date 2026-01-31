import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const nearFuture = goals.filter((g) => g.timeframe === 'near')
    const farFuture = goals.filter((g) => g.timeframe === 'far')

    const values = await prisma.value.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      nearFuture: nearFuture.map((g) => ({
        id: g.id,
        text: g.text,
        category: g.category,
        completed: g.completed,
        progress: g.progress,
        createdAt: g.createdAt.toISOString().split('T')[0],
        deadline: g.deadline,
        context: g.context,
      })),
      farFuture: farFuture.map((g) => ({
        id: g.id,
        text: g.text,
        category: g.category,
        completed: g.completed,
        createdAt: g.createdAt.toISOString().split('T')[0],
        context: g.context,
      })),
      values: values.map((v) => v.text),
    })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { goalId, completed, progress } = await request.json()

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (completed !== undefined) {
      updateData.completed = completed
      if (completed) updateData.completedAt = new Date()
    }
    if (progress !== undefined) updateData.progress = progress

    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    })

    return NextResponse.json({ success: true, goal })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}
