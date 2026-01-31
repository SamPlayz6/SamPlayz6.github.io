/**
 * Instagram data export parser.
 * Extracts saved and liked posts from Instagram's JSON export format.
 */

interface InstagramSavedPost {
  title: string
  media_list_data?: Array<{
    title: string
    media_url?: string
    uri?: string
  }>
  string_map_data?: {
    'Saved on'?: { timestamp: number }
    [key: string]: { value?: string; timestamp?: number } | undefined
  }
}

interface InstagramLikedPost {
  title: string
  string_list_data?: Array<{
    href?: string
    value?: string
    timestamp?: number
  }>
}

export interface ParsedInspirationItem {
  id: string
  category: 'movement' | 'innovation' | 'travel' | 'philosophy' | 'people'
  type: 'video' | 'image' | 'quote' | 'article' | 'profile'
  title: string
  content: string
  source: string
  addedAt: string
  tags: string[]
}

function categorizeFromText(text: string): ParsedInspirationItem['category'] {
  const lower = text.toLowerCase()

  if (/parkour|freerun|movement|training|vault|flip|storror/i.test(lower)) return 'movement'
  if (/startup|tech|ai|code|innovat|build/i.test(lower)) return 'innovation'
  if (/japan|travel|tokyo|trip|adventure|explore/i.test(lower)) return 'travel'
  if (/quote|wisdom|stoic|philosophy|mindset|life/i.test(lower)) return 'philosophy'

  return 'people'
}

function generateId(prefix: string, index: number): string {
  return `ig-${prefix}-${Date.now()}-${index}`
}

export function parseInstagramExport(data: unknown): ParsedInspirationItem[] {
  const items: ParsedInspirationItem[] = []

  if (!data || typeof data !== 'object') return items

  const root = data as Record<string, unknown>

  // Handle saved posts (saved_saved_media.json or similar)
  const savedCollections =
    (root.saved_saved_media as InstagramSavedPost[]) ||
    (root.saved_media as InstagramSavedPost[]) ||
    []

  if (Array.isArray(savedCollections)) {
    for (let i = 0; i < savedCollections.length; i++) {
      const post = savedCollections[i]
      const title = post.title || `Saved post ${i + 1}`
      const url =
        post.media_list_data?.[0]?.uri ||
        post.media_list_data?.[0]?.media_url ||
        ''
      const savedOn = post.string_map_data?.['Saved on']?.timestamp
      const addedAt = savedOn
        ? new Date(savedOn * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      items.push({
        id: generateId('saved', i),
        category: categorizeFromText(title),
        type: url.includes('video') ? 'video' : 'image',
        title: title.slice(0, 100),
        content: url || title,
        source: 'Instagram (saved)',
        addedAt,
        tags: ['instagram', 'saved'],
      })
    }
  }

  // Handle liked posts (liked_posts.json or similar)
  const likedPosts =
    (root.likes_media_likes as InstagramLikedPost[]) ||
    (root.liked_posts as InstagramLikedPost[]) ||
    []

  if (Array.isArray(likedPosts)) {
    for (let i = 0; i < likedPosts.length; i++) {
      const post = likedPosts[i]
      const title = post.title || `Liked post ${i + 1}`
      const firstData = post.string_list_data?.[0]
      const url = firstData?.href || ''
      const timestamp = firstData?.timestamp
      const addedAt = timestamp
        ? new Date(timestamp * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      items.push({
        id: generateId('liked', i),
        category: categorizeFromText(title + (url || '')),
        type: 'image',
        title: title.slice(0, 100),
        content: url || title,
        source: 'Instagram (liked)',
        addedAt,
        tags: ['instagram', 'liked'],
      })
    }
  }

  return items
}
