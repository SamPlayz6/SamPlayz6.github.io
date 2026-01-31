export const dynamic = 'force-dynamic'

import { getDashboardData, formatDate, daysSince } from '@/lib/data'
import QuickLinks from '@/components/dashboard/QuickLinks'
import QuadrantCard from '@/components/dashboard/QuadrantCard'
import RightNowPanel from '@/components/dashboard/RightNowPanel'
import BalanceIndicator from '@/components/dashboard/BalanceIndicator'
import type { QuadrantCategory, QuadrantStatus } from '@/types/dashboard'

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Transform quadrant data for the cards
  const quadrantOrder: QuadrantCategory[] = ['relationships', 'parkour', 'work', 'travel']

  // Transform right now data for the panel
  const rightNowData = {
    weekOf: formatDate(data.rightNow.weekOf),
    quadrantStatuses: data.rightNow.quadrantStatuses as Record<QuadrantCategory, QuadrantStatus>,
    summary: data.rightNow.summary,
    valuesAlignment: data.rightNow.valuesAlignment,
    actionables: data.rightNow.actionables.map((a) => ({
      id: a.id,
      suggestion: a.text,
      priority: a.priority as 'low' | 'medium' | 'high',
      effort: a.effort === 'minimal' ? 'easy' : a.effort === 'moderate' ? 'medium' : 'hard' as 'easy' | 'medium' | 'hard',
      impact: a.impact as 'small' | 'medium' | 'large',
    })),
    celebration: data.rightNow.celebration,
    friendlyNote: data.rightNow.friendlyNote,
  }

  // Get balance check data if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rightNowAny = data.rightNow as any
  const balanceCheck = rightNowAny.balanceCheck as {
    mood?: string
    recentJournalSignals?: string[]
    recommendation?: string
  } | undefined

  const currentPhase = rightNowAny.currentPhase as {
    name?: string
    goal?: string
    keyMilestone?: string
  } | undefined

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <QuickLinks />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Sam</h1>
          <p className="text-dashboard-text-secondary">
            Here&apos;s what&apos;s happening in your life
          </p>
        </div>

        {/* Balance & Right Now Row */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Indicator - smaller */}
          <div className="lg:col-span-1">
            <BalanceIndicator
              score={data.rightNow.valuesAlignment?.score || 0}
              mood={balanceCheck?.mood}
              signals={balanceCheck?.recentJournalSignals}
              recommendation={balanceCheck?.recommendation}
            />
          </div>

          {/* Right Now Panel - larger */}
          <div className="lg:col-span-2">
            <RightNowPanel data={rightNowData} />
          </div>
        </section>

        {/* Quadrant Cards Grid */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Life Quadrants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quadrantOrder.map((category) => {
              const quadrant = data.quadrants[category]
              // Type assertion for extra properties
              const extendedQuadrant = quadrant as typeof quadrant & {
                currentFocus?: { company?: string; description?: string; stage?: string }
                japanDream?: { status?: string; quote?: string }
                trainingPhilosophy?: string
                skills?: Array<{ name: string; status: string }>
                activityPulse?: boolean
              }

              return (
                <QuadrantCard
                  key={category}
                  type={category}
                  name={quadrant.name}
                  status={quadrant.status}
                  lastActivity={quadrant.lastActivity || new Date().toISOString()}
                  activityPulse={extendedQuadrant.activityPulse}
                  recentEntries={quadrant.recentEntries.map((e) => ({
                    id: e.id,
                    date: formatDate(e.date),
                    title: e.title,
                    content: e.content,
                    imageUrl: e.imageUrl,
                    significance: e.significance,
                  }))}
                  people={quadrant.people}
                  skills={extendedQuadrant.skills}
                  metrics={quadrant.metrics}
                  currentFocus={extendedQuadrant.currentFocus}
                  japanDream={extendedQuadrant.japanDream}
                  trainingPhilosophy={extendedQuadrant.trainingPhilosophy}
                />
              )
            })}
          </div>
        </section>

        {/* Quick Stats Footer */}
        <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dashboard-card rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-quadrant-relationships">
              {data.quadrants.relationships.people?.length || 0}
            </p>
            <p className="text-xs text-dashboard-text-muted">Key People</p>
          </div>
          <div className="bg-dashboard-card rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-quadrant-parkour">
              {data.quadrants.parkour.metrics?.trainingSessions || 0}
            </p>
            <p className="text-xs text-dashboard-text-muted">Training Sessions</p>
          </div>
          <div className="bg-dashboard-card rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-quadrant-work">
              {data.quadrants.work.githubStats?.commits || 0}
            </p>
            <p className="text-xs text-dashboard-text-muted">Commits</p>
          </div>
          <div className="bg-dashboard-card rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-quadrant-travel">
              {data.quadrants.travel.travelStats?.daysSinceLastTrip || '?'}
            </p>
            <p className="text-xs text-dashboard-text-muted">Days Since Trip</p>
          </div>
        </section>

        {/* Current Phase Banner */}
        {currentPhase && (
          <section className="mt-8">
            <div className="bg-gradient-to-r from-quadrant-work/20 to-quadrant-work/5 rounded-xl p-6 border border-quadrant-work/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-quadrant-work uppercase tracking-wider">Current Phase</p>
                  <h3 className="text-lg font-bold text-white">
                    {currentPhase.name}
                  </h3>
                  <p className="text-sm text-dashboard-text-muted">
                    {currentPhase.goal}
                  </p>
                </div>
                {currentPhase.keyMilestone && (
                  <div className="text-right">
                    <p className="text-xs text-dashboard-text-muted">Key Milestone</p>
                    <p className="text-sm text-white font-medium">
                      {currentPhase.keyMilestone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
