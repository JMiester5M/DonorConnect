// Authentication API - User Logout
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export async function POST(request) {
  try {
    // Get session token from cookies
    const sessionToken = request.cookies.get('session')?.value

    if (sessionToken) {
      // Delete session using deleteSession function
      await deleteSession(sessionToken)
    }

    // Return success response
    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}