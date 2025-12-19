// Session management for authentication
import { cookies } from 'next/headers'
import { prisma } from './db'
import crypto from 'crypto'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

/**
 * Create a new session for a user
 * @param {string} userId - User ID to create session for
 * @returns {Promise<string>} Session token
 */
export async function createSession(userId) {
  // Generate secure session token
  const sessionToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  // Store session in database
  await prisma.session.create({
    data: {
      token: sessionToken,
      userId,
      expiresAt,
    },
  })

  // Set HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  })

  return sessionToken
}

/**
 * Get session and user data from session token
 * @param {string} sessionToken - Session token to validate
 * @returns {Promise<Object|null>} Session with user data or null
 */
export async function getSession(sessionToken) {
  if (!sessionToken) {
    return null
  }

  // Query database for session and user
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        include: {
          organization: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    // Delete expired session
    await prisma.session.delete({
      where: { token: sessionToken },
    })
    return null
  }

  // Return session with user data (without password)
  const { user } = session
  const { password: _, ...userWithoutPassword } = user

  return {
    token: sessionToken,
    user: userWithoutPassword,
  }
}

/**
 * Get current user from session (for server components)
 * @returns {Promise<Object|null>} User object or null
 */
export async function getSessionUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) {
    return null
  }

  const session = await getSession(sessionToken)
  return session?.user || null
}

/**
 * Delete a session (logout)
 * @param {string} sessionToken - Session token to delete
 */
export async function deleteSession(sessionToken) {
  // Delete session from database
  await prisma.session.delete({
    where: { token: sessionToken },
  })

  // Clear session cookie
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
