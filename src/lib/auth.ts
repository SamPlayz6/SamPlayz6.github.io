import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'dashboard_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function verifyPassword(password: string): boolean {
  const correctPassword = process.env.DASHBOARD_PASSWORD
  if (!correctPassword) {
    console.error('DASHBOARD_PASSWORD environment variable is not set')
    return false
  }
  return password === correctPassword
}

export function createSessionToken(): string {
  // Simple session token - in production you might want something more robust
  return Buffer.from(Date.now().toString() + '-' + Math.random().toString(36)).toString('base64')
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSessionCookie()
  return !!session
}
