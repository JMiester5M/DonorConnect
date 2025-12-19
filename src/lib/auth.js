// Authentication utilities
import { prisma } from './db'
import { hashPassword, verifyPassword } from './password'

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user object
 */
export async function register(userData) {
  const { firstName, lastName, email, password, organizationName } = userData

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: organizationName,
    },
  })

  // Create user in database
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      organizationId: organization.id,
    },
    include: {
      organization: true,
    },
  })

  // Return user object without password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

/**
 * Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object or null if invalid
 */
export async function login(email, password) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organization: true,
    },
  })

  if (!user) {
    return null
  }

  // Verify password
  const passwordMatch = await verifyPassword(password, user.password)

  if (!passwordMatch) {
    return null
  }

  // Return user object without password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
    },
  })

  if (!user) {
    return null
  }

  // Return user object without password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}