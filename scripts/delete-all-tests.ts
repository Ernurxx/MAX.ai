import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Deleting all test attempts...')
  const deletedAttempts = await prisma.testAttempt.deleteMany({})
  console.log(`Deleted ${deletedAttempts.count} test attempt(s)`)

  console.log('Deleting all practice tests...')
  const deletedTests = await prisma.test.deleteMany({})
  console.log(`Deleted ${deletedTests.count} test(s)`)

  console.log('Done. All practice tests removed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
