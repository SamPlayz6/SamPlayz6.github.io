import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { ManualEntry } from '@/types/dashboard'

const MANUAL_ENTRIES_FILE = path.join(process.cwd(), 'data', 'manual_entries.json')

async function getManualEntries(): Promise<ManualEntry[]> {
  try {
    const data = await fs.readFile(MANUAL_ENTRIES_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    // File doesn't exist yet, return empty array
    return []
  }
}

async function saveManualEntries(entries: ManualEntry[]): Promise<void> {
  await fs.writeFile(MANUAL_ENTRIES_FILE, JSON.stringify(entries, null, 2))
}

export async function GET() {
  try {
    const entries = await getManualEntries()
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching manual entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manual entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, category, imageUrl, link } = body

    if (!content || !category) {
      return NextResponse.json(
        { error: 'Content and category are required' },
        { status: 400 }
      )
    }

    const entries = await getManualEntries()

    const newEntry: ManualEntry = {
      id: `manual-${Date.now()}`,
      content,
      category,
      imageUrl,
      link,
      createdAt: new Date().toISOString(),
      processed: false,
    }

    entries.push(newEntry)
    await saveManualEntries(entries)

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error('Error saving manual entry:', error)
    return NextResponse.json(
      { error: 'Failed to save manual entry' },
      { status: 500 }
    )
  }
}
