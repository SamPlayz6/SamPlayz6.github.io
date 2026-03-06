import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {}

  // Check env vars
  checks.DATABASE_URL = process.env.DATABASE_URL ? 'set' : 'MISSING'
  checks.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING'
  checks.GITHUB_TOKEN = process.env.GITHUB_TOKEN ? 'set' : 'MISSING'
  checks.GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'MISSING'
  checks.VAULT_REPO = process.env.VAULT_REPO || 'not set (optional)'
  checks.GOOGLE_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'set' : 'not set (optional)'

  // Test Claude API
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    checks.claude_api = `working (response: ${text.trim()})`
  } catch (error) {
    const err = error as Error & { status?: number }
    checks.claude_api = `FAILED: ${err.message} (status: ${err.status})`
  }

  // Test GitHub API
  try {
    const res = await fetch(`https://api.github.com/users/${process.env.GITHUB_USERNAME || 'SamPlayz6'}`, {
      headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {},
    })
    checks.github_api = res.ok ? `working (${res.status})` : `FAILED (${res.status})`
  } catch (error) {
    checks.github_api = `FAILED: ${(error as Error).message}`
  }

  // Test DB
  try {
    const { prisma } = await import('@/lib/prisma')
    const count = await prisma.quadrant.count()
    checks.database = `working (${count} quadrants)`
  } catch (error) {
    checks.database = `FAILED: ${(error as Error).message}`
  }

  return NextResponse.json(checks, { status: 200 })
}
