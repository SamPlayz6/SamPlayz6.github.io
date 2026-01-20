import { promises as fs } from 'fs'
import path from 'path'
import type {
  Quadrant,
  QuadrantCategory,
  RightNow,
  TimelineEntry,
  Goals,
  InspirationItem,
  Metadata,
  DashboardData,
} from '@/types/dashboard'

const DATA_DIR = path.join(process.cwd(), 'data')

async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename)
  const fileContents = await fs.readFile(filePath, 'utf8')
  return JSON.parse(fileContents) as T
}

export async function getQuadrants(): Promise<Record<QuadrantCategory, Quadrant>> {
  return readJsonFile<Record<QuadrantCategory, Quadrant>>('quadrants.json')
}

export async function getRightNow(): Promise<RightNow> {
  return readJsonFile<RightNow>('right_now.json')
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  return readJsonFile<TimelineEntry[]>('timeline.json')
}

export async function getGoals(): Promise<Goals> {
  return readJsonFile<Goals>('goals.json')
}

export async function getInspiration(): Promise<InspirationItem[]> {
  return readJsonFile<InspirationItem[]>('inspiration.json')
}

export async function getMetadata(): Promise<Metadata> {
  return readJsonFile<Metadata>('metadata.json')
}

export async function getDashboardData(): Promise<DashboardData> {
  const [quadrants, rightNow, timeline, goals, inspiration, metadata] = await Promise.all([
    getQuadrants(),
    getRightNow(),
    getTimeline(),
    getGoals(),
    getInspiration(),
    getMetadata(),
  ])

  return {
    quadrants,
    rightNow,
    timeline,
    goals,
    inspiration,
    metadata,
  }
}

// Utility function to get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'thriving':
      return 'bg-status-thriving'
    case 'needs_attention':
      return 'bg-status-attention'
    case 'neglected':
      return 'bg-status-neglected'
    default:
      return 'bg-gray-500'
  }
}

// Utility function to get quadrant color
export function getQuadrantColor(category: QuadrantCategory): string {
  const colors: Record<QuadrantCategory, string> = {
    relationships: '#FF6B6B',
    parkour: '#4ECDC4',
    work: '#9B59B6',
    travel: '#F9CA24',
  }
  return colors[category]
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

// Get days since a date
export function daysSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
