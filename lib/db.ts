// Temporary workaround: Use dynamic import to handle missing @prisma/client
// Once Prisma Client is generated (npm run db:generate), change this back to:
// import { PrismaClient } from '@prisma/client'
let PrismaClient: any
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClient = require('@prisma/client').PrismaClient
} catch {
  // Fallback stub - will throw helpful error at runtime
  // Use relative path since require() doesn't understand TypeScript path aliases
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClient = require('../types/prisma').PrismaClient
}

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined
}

export const prisma =
  globalForPrisma.prisma ?? (new PrismaClient() as InstanceType<typeof PrismaClient>)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
