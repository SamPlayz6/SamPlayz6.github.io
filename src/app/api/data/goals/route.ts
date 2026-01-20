import { NextResponse } from 'next/server'
import { getGoals } from '@/lib/data'

export async function GET() {
  try {
    const goals = await getGoals()
    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}
