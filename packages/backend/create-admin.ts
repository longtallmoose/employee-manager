import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

// We pass the URL here because we removed it from the schema
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function main() {
  const email = 'admin@staffpilot.com'
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN, 
        firstName: 'System',
        lastName: 'Admin',
      },
    })
    console.log(`\n✅ SUCCESS! Created user: ${user.email}`)
    console.log(`🔑 Password: ${password}\n`)
  } catch (e) {
    console.error('Error creating user:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()