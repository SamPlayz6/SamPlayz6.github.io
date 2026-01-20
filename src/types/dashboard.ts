// Life Dashboard Type Definitions

export type QuadrantCategory = 'relationships' | 'parkour' | 'work' | 'travel'
export type QuadrantStatus = 'thriving' | 'needs_attention' | 'neglected'
export type Significance = 'minor' | 'notable' | 'major'

// Timeline Entry - individual moments in your life story
export interface TimelineEntry {
  id: string
  date: string
  category: QuadrantCategory
  title: string
  content: string
  imageUrl?: string
  sourceNote?: string
  significance: Significance
}

// Person tracking for relationships quadrant
export interface Person {
  name: string
  mentionCount: number
  lastMentioned: string
  connectionQuality?: 'deep' | 'regular' | 'casual'
}

// Skill tracking for parkour quadrant
export interface Skill {
  name: string
  status: 'practicing' | 'landed' | 'mastered'
  firstMentioned: string
  lastMentioned: string
}

// Quadrant data structure
export interface Quadrant {
  name: string
  category: QuadrantCategory
  color: string
  status: QuadrantStatus
  lastActivity: string
  activityPulse: boolean
  recentEntries: TimelineEntry[]
  metrics: Record<string, string | number>
  // Quadrant-specific data
  people?: Person[]           // For relationships
  skills?: Skill[]            // For parkour
  githubStats?: {             // For work
    commits: number
    repos: string[]
    streak: number
  }
  travelStats?: {             // For travel
    daysSinceLastTrip: number
    tripsThisYear: number
    flightAlerts: number
    japaneseLevel?: string
    yearsStudying?: number
  }
}

// Actionable item from AI analysis
export interface Actionable {
  id: string
  text: string
  priority: 'low' | 'medium' | 'high'
  effort: 'minimal' | 'moderate' | 'significant'
  impact: 'small' | 'medium' | 'large'
  quadrant?: QuadrantCategory
}

// Right Now panel - current state snapshot
export interface RightNow {
  weekOf: string
  lastUpdated: string
  quadrantStatuses: Record<QuadrantCategory, QuadrantStatus>
  summary: string
  valuesAlignment: {
    score: number // 0-100
    livingWell: string[]
    needsAttention: string[]
    note: string
  }
  actionables: Actionable[]
  celebration: string
  friendlyNote: string
}

// Goal tracking
export interface Goal {
  id: string
  text: string
  category?: QuadrantCategory
  completed: boolean
  progress?: number // 0-100
  createdAt: string
  completedAt?: string
}

export interface Goals {
  nearFuture: Goal[] // Next 3 months
  farFuture: Goal[]  // 1-2 years
}

// Inspiration item types
export type InspirationCategory = 'movement' | 'innovation' | 'travel' | 'philosophy' | 'people'
export type InspirationType = 'video' | 'image' | 'quote' | 'article' | 'profile'

export interface InspirationItem {
  id: string
  category: InspirationCategory
  type: InspirationType
  title: string
  content: string // URL for videos/images/articles, text for quotes
  source?: string
  personName?: string // For people category
  addedAt: string
  tags?: string[]
}

// Metadata for processing
export interface Metadata {
  lastProcessed: string
  lastNoteScanned: string
  totalEntriesProcessed: number
  version: string
}

// Manual entry for user input
export interface ManualEntry {
  id: string
  content: string
  category: QuadrantCategory
  imageUrl?: string
  link?: string
  createdAt: string
  processed: boolean
}

// Dashboard data bundle (what the frontend loads)
export interface DashboardData {
  quadrants: Record<QuadrantCategory, Quadrant>
  rightNow: RightNow
  timeline: TimelineEntry[]
  goals: Goals
  inspiration: InspirationItem[]
  metadata: Metadata
}
