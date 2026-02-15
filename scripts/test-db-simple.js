// Simple database connection test using Prisma
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('\n=== Testing Database Connection ===\n')
    
    // Test connection
    await prisma.$connect()
    console.log('✓ Connected to PostgreSQL successfully!\n')
    
    // Check if tables exist by trying to count records
    console.log('Checking tables...\n')
    
    try {
      const userCount = await prisma.user.count()
      console.log(`✓ User table exists - ${userCount} users found`)
      
      if (userCount > 0) {
        const users = await prisma.user.findMany({ take: 5 })
        console.log('\nSample users:')
        users.forEach(user => {
          console.log(`  - ${user.name} (${user.email || 'no email'}) - Role: ${user.role}`)
        })
      } else {
        console.log('  ⚠️  No users in database yet - run: npm run db:seed')
      }
    } catch (e) {
      console.log('✗ User table does NOT exist')
      console.log('   Run: npm run db:push -- --accept-data-loss')
    }
    
    try {
      const lessonCount = await prisma.lesson.count()
      console.log(`✓ Lesson table exists - ${lessonCount} lessons found`)
    } catch (e) {
      console.log('✗ Lesson table does NOT exist')
    }
    
    try {
      const flashcardCount = await prisma.flashcard.count()
      console.log(`✓ Flashcard table exists - ${flashcardCount} flashcards found`)
    } catch (e) {
      console.log('✗ Flashcard table does NOT exist')
    }
    
    try {
      const testCount = await prisma.test.count()
      console.log(`✓ Test table exists - ${testCount} tests found`)
    } catch (e) {
      console.log('✗ Test table does NOT exist')
    }
    
    console.log('\n=== Database Status ===\n')
    console.log('Database: Connected ✓')
    console.log('Location: localhost:5432/maxai')
    console.log('\nNext steps:')
    console.log('  1. If tables missing: npm run db:push -- --accept-data-loss')
    console.log('  2. If no data: npm run db:seed')
    console.log('')
    
  } catch (error) {
    console.error('\n✗ Database connection failed!')
    console.error('Error:', error.message)
    
    if (error.code === 'P1001') {
      console.error('\n⚠️  Cannot reach database server')
      console.error('   - Check if PostgreSQL is running')
      console.error('   - Verify DATABASE_URL in .env')
    } else if (error.code === 'P1003') {
      console.error('\n⚠️  Database does not exist')
      console.error('   - Create it: createdb maxai')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
