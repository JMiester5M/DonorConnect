// Authentication API - User Registration
import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'

export async function POST(request) {
  try {
    // Parse request body
    const { firstName, lastName, email, password, organizationName } = await request.json()

    // Validate input data
    if (!firstName || !lastName || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Register user with register function
    const user = await register({
      firstName,
      lastName,
      email,
      password,
      organizationName,
    })

    // Return success response with user data
    return NextResponse.json(
      { user, message: 'Registration successful' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}