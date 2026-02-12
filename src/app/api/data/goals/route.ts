import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGoal = any

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const nearFuture = goals.filter((g: AnyGoal) => g.timeframe === 'near')
    const farFuture = goals.filter((g: AnyGoal) => g.timeframe === 'far')

    const values = await prisma.value.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      nearFuture: nearFuture.map((g: AnyGoal) => ({
        id: g.id,
        text: g.text,
        category: g.category,
        completed: g.completed,
        progress: g.progress,
        createdAt: g.createdAt.toISOString().split('T')[0],
        deadline: g.deadline,
        context: g.context,
      })),
      farFuture: farFuture.map((g: AnyGoal) => ({
        id: g.id,
        text: g.text,
        category: g.category,
        completed: g.completed,
        createdAt: g.createdAt.toISOString().split('T')[0],
        context: g.context,
      })),
      values: values.map((v: AnyGoal) => v.text),
    })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { text, category, timeframe } = await request.json()

    if (!text || !timeframe) {
      return NextResponse.json({ error: 'Text and timeframe are required' }, { status: 400 })
    }

    const id = `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const goal = await prisma.goal.create({
      data: {
        id,
        text,
        category: category || null,
        timeframe,
        completed: false,
        progress: timeframe === 'near' ? 0 : null,
      },
    })

    return NextResponse.json({ success: true, goal })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
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
      else updateData.completedAt = null
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('id')

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 })
    }

    await prisma.goal.delete({
      where: { id: goalId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
