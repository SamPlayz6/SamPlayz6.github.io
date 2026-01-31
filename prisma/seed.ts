import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { readFileSync } from 'fs'
import { join } from 'path'

import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function readJson(filename: string) {
  const filePath = join(process.cwd(), 'data', filename)
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    console.log(`Warning: ${filename} not found, skipping`)
    return null
  }
}

// Helper: convert null to Prisma.DbNull for nullable Json fields
function jsonOrNull(val: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (val === null || val === undefined) return Prisma.DbNull
  return val as Prisma.InputJsonValue
}

async function main() {
  console.log('Seeding database from data/*.json files...')

  // Seed Quadrants
  const quadrants = readJson('quadrants.json')
  if (quadrants) {
    for (const [category, data] of Object.entries(quadrants)) {
      const q = data as Record<string, unknown>
      const {
        name, color, status, lastActivity, activityPulse,
        recentEntries, metrics, people, skills, githubStats, travelStats,
        ...extra
      } = q

      const quadrantData = {
        name: name as string,
        color: color as string,
        status: status as string,
        lastActivity: lastActivity as string,
        activityPulse: (activityPulse as boolean) || false,
        recentEntries: (recentEntries as Prisma.InputJsonValue) || [],
        metrics: (metrics as Prisma.InputJsonValue) || {},
        people: jsonOrNull(people),
        skills: jsonOrNull(skills),
        githubStats: jsonOrNull(githubStats),
        travelStats: jsonOrNull(travelStats),
        extraData: Object.keys(extra).length > 0 ? (extra as Prisma.InputJsonValue) : Prisma.DbNull,
      }

      await prisma.quadrant.upsert({
        where: { category },
        update: quadrantData,
        create: { category, ...quadrantData },
      })
      console.log(`  Quadrant: ${category}`)
    }
  }

  // Seed Timeline
  const timeline = readJson('timeline.json')
  if (timeline && Array.isArray(timeline)) {
    for (const entry of timeline) {
      await prisma.timelineEntry.upsert({
        where: { id: entry.id },
        update: {
          date: entry.date,
          category: entry.category,
          title: entry.title,
          content: entry.content,
          imageUrl: entry.imageUrl || null,
          sourceNote: entry.sourceNote || null,
          significance: entry.significance,
        },
        create: {
          id: entry.id,
          date: entry.date,
          category: entry.category,
          title: entry.title,
          content: entry.content,
          imageUrl: entry.imageUrl || null,
          sourceNote: entry.sourceNote || null,
          significance: entry.significance,
        },
      })
    }
    console.log(`  Timeline: ${timeline.length} entries`)
  }

  // Seed Goals
  const goals = readJson('goals.json')
  if (goals) {
    for (const goal of goals.nearFuture || []) {
      await prisma.goal.upsert({
        where: { id: goal.id },
        update: {
          text: goal.text,
          category: goal.category || null,
          timeframe: 'near',
          completed: goal.completed || false,
          progress: goal.progress ?? null,
          deadline: goal.deadline || null,
          context: goal.context || null,
        },
        create: {
          id: goal.id,
          text: goal.text,
          category: goal.category || null,
          timeframe: 'near',
          completed: goal.completed || false,
          progress: goal.progress ?? null,
          deadline: goal.deadline || null,
          context: goal.context || null,
          createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date(),
        },
      })
    }
    for (const goal of goals.farFuture || []) {
      await prisma.goal.upsert({
        where: { id: goal.id },
        update: {
          text: goal.text,
          category: goal.category || null,
          timeframe: 'far',
          completed: goal.completed || false,
          context: goal.context || null,
        },
        create: {
          id: goal.id,
          text: goal.text,
          category: goal.category || null,
          timeframe: 'far',
          completed: goal.completed || false,
          context: goal.context || null,
          createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date(),
        },
      })
    }
    console.log(`  Goals: ${(goals.nearFuture?.length || 0) + (goals.farFuture?.length || 0)} goals`)

    // Seed Values
    if (goals.values && Array.isArray(goals.values)) {
      for (let i = 0; i < goals.values.length; i++) {
        await prisma.value.create({
          data: {
            text: goals.values[i],
            sortOrder: i,
          },
        })
      }
      console.log(`  Values: ${goals.values.length}`)
    }
  }

  // Seed Inspiration
  const inspiration = readJson('inspiration.json')
  if (inspiration && Array.isArray(inspiration)) {
    for (const item of inspiration) {
      await prisma.inspirationItem.upsert({
        where: { id: item.id },
        update: {
          category: item.category,
          type: item.type,
          title: item.title,
          content: item.content,
          source: item.source || null,
          personName: item.personName || null,
          addedAt: item.addedAt,
          tags: jsonOrNull(item.tags),
        },
        create: {
          id: item.id,
          category: item.category,
          type: item.type,
          title: item.title,
          content: item.content,
          source: item.source || null,
          personName: item.personName || null,
          addedAt: item.addedAt,
          tags: jsonOrNull(item.tags),
        },
      })
    }
    console.log(`  Inspiration: ${inspiration.length} items`)
  }

  // Seed RightNow
  const rightNow = readJson('right_now.json')
  if (rightNow) {
    const {
      weekOf, lastUpdated, quadrantStatuses, summary,
      valuesAlignment, actionables, celebration, friendlyNote,
      ...extra
    } = rightNow

    await prisma.rightNowSnapshot.create({
      data: {
        weekOf,
        lastUpdated: lastUpdated || new Date().toISOString(),
        quadrantStatuses: quadrantStatuses || {},
        summary: summary || '',
        valuesAlignment: valuesAlignment || {},
        actionables: actionables || [],
        celebration: celebration || '',
        friendlyNote: friendlyNote || '',
        extraData: Object.keys(extra).length > 0 ? (extra as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    })
    console.log(`  RightNow: snapshot created`)
  }

  // Seed Metadata
  const metadata = readJson('metadata.json')
  if (metadata) {
    await prisma.processingMetadata.upsert({
      where: { id: 'singleton' },
      update: {
        lastProcessed: metadata.lastProcessed || null,
        lastNoteScanned: metadata.lastNoteScanned || null,
        totalEntriesProcessed: metadata.totalEntriesProcessed || 0,
        version: metadata.version || '1.0.0',
      },
      create: {
        id: 'singleton',
        lastProcessed: metadata.lastProcessed || null,
        lastNoteScanned: metadata.lastNoteScanned || null,
        totalEntriesProcessed: metadata.totalEntriesProcessed || 0,
        version: metadata.version || '1.0.0',
      },
    })
    console.log(`  Metadata: seeded`)
  }

  // Seed Manual Entries
  const manualEntries = readJson('manual_entries.json')
  if (manualEntries && Array.isArray(manualEntries) && manualEntries.length > 0) {
    for (const entry of manualEntries) {
      await prisma.manualEntry.create({
        data: {
          content: entry.content,
          category: entry.category,
          imageUrl: entry.imageUrl || null,
          link: entry.link || null,
          processed: entry.processed || false,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
        },
      })
    }
    console.log(`  Manual entries: ${manualEntries.length}`)
  }

  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
