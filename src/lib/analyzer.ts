/**
 * Claude API integration for life analysis.
 * Port of backend/claude_analyzer.py to TypeScript.
 */

import Anthropic from '@anthropic-ai/sdk'
import { getSystemPrompt, getUserPrompt } from './prompts'

interface AnalysisResult {
  timeline_entries: Array<{
    id: string
    date: string
    category: string
    title: string
    content: string
    significance: string
  }>
  quadrant_updates: Record<
    string,
    {
      status: string
      lastActivity: string
      activityPulse: boolean
      recentHighlight?: string
      metrics?: Record<string, unknown>
    }
  >
  right_now: {
    summary: string
    valuesAlignment: {
      score: number
      livingWell: string[]
      needsAttention: string[]
      note: string
    }
    actionables: Array<{
      id: string
      text: string
      priority: string
      effort: string
      impact: string
      quadrant?: string
    }>
    celebration: string
    friendlyNote: string
    balanceCheck?: {
      mood: string
      recommendation?: string
    }
  }
  extracted_goals?: Array<{
    id: string
    text: string
    category: string
    timeframe: string
    progress?: number
  }>
  extracted_inspiration?: Array<{
    id: string
    category: string
    type: string
    title: string
    content: string
    source?: string
  }>
}

export async function analyzeLifeData(
  notesSummary: Parameters<typeof getUserPrompt>[0],
  githubSummary: Parameters<typeof getUserPrompt>[1],
  manualEntries: Parameters<typeof getUserPrompt>[2],
  currentQuadrants: Parameters<typeof getUserPrompt>[3],
  days: number = 14
): Promise<AnalysisResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set')
    return null
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = getSystemPrompt()
  const userPrompt = getUserPrompt(
    notesSummary,
    githubSummary,
    manualEntries,
    currentQuadrants,
    days
  )

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    let responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code blocks if present
    if (responseText.startsWith('```')) {
      responseText = responseText.split('\n').slice(1).join('\n')
      if (responseText.endsWith('```')) {
        responseText = responseText.split('\n').slice(0, -1).join('\n')
      }
    }

    const analysis: AnalysisResult = JSON.parse(responseText)
    return analysis
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Error parsing Claude response as JSON:', error)
    } else {
      console.error('Error calling Claude API:', error)
    }
    return null
  }
}

export function validateAnalysis(analysis: AnalysisResult): boolean {
  const requiredKeys: (keyof AnalysisResult)[] = [
    'timeline_entries',
    'quadrant_updates',
    'right_now',
  ]

  for (const key of requiredKeys) {
    if (!(key in analysis)) {
      console.error(`Missing required key in analysis: ${key}`)
      return false
    }
  }

  const rightNow = analysis.right_now
  const rightNowKeys = ['summary', 'valuesAlignment', 'actionables', 'celebration', 'friendlyNote']
  for (const key of rightNowKeys) {
    if (!(key in rightNow)) {
      console.error(`Missing key in right_now: ${key}`)
      return false
    }
  }

  return true
}
