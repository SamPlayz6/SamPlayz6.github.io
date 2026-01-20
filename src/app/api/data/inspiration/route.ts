import { NextResponse } from 'next/server'
import { getInspiration } from '@/lib/data'

export async function GET() {
  try {
    const inspiration = await getInspiration()
    return NextResponse.json(inspiration)
  } catch (error) {
    console.error('Error fetching inspiration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inspiration' },
      { status: 500 }
    )
  }
}
