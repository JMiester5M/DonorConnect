import { prisma } from '../src/lib/db.js'
import { hashPassword } from '../src/lib/password.js'

function randomPassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  const donors = await prisma.donor.findMany({ where: { email: { not: null } } })
  for (const donor of donors) {
    const password = randomPassword(14)
    const hashed = await hashPassword(password)
    await prisma.user.upsert({
      where: { email: donor.email },
      update: {
        password: hashed,
        role: 'DONOR',
        organizationId: donor.organizationId,
        firstName: donor.firstName,
        lastName: donor.lastName,
      },
      create: {
        email: donor.email,
        password: hashed,
        role: 'DONOR',
        organizationId: donor.organizationId,
        firstName: donor.firstName,
        lastName: donor.lastName,
      },
    })
    console.log(`Donor: ${donor.email} | Password: ${password}`)
  }
  console.log('All donor users updated.')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
