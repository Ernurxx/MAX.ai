// Test database connection without Prisma
const { Client } = require('pg')
require('dotenv').config()

async function testConnection() {
  console.log('Testing PostgreSQL connection...\n')
  console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'))
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('✓ Successfully connected to PostgreSQL!\n')

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)

    console.log('Tables in database:')
    if (tablesResult.rows.length === 0) {
      console.log('  ⚠️  No tables found! Database needs to be set up.')
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`)
      })
    }

    // Check if User table has data
    try {
      const userCount = await client.query('SELECT COUNT(*) FROM "User"')
      console.log(`\nUsers in database: ${userCount.rows[0].count}`)
      
      if (userCount.rows[0].count > 0) {
        const users = await client.query('SELECT id, name, email, role FROM "User" LIMIT 5')
        console.log('\nSample users:')
        users.rows.forEach(user => {
          console.log(`  - ${user.name} (${user.email || 'no email'}) - Role: ${user.role}`)
        })
      }
      
      // Check if lastName column exists
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'lastName'
      `)
      
      if (columnCheck.rows.length > 0) {
        console.log('\n✓ lastName column exists in User table')
      } else {
        console.log('\n⚠️  lastName column NOT found in User table - needs migration')
      }
    } catch (err) {
      console.log('\n⚠️  User table not found or empty')
    }

    await client.end()
    console.log('\n✓ Database connection test complete')
    
  } catch (error) {
    console.error('✗ Database connection failed:')
    console.error('Error:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nPostgreSQL is not running or not accessible at localhost:5432')
      console.error('Start PostgreSQL with: pg_ctl start')
    } else if (error.code === '28P01') {
      console.error('\nAuthentication failed - check username/password in DATABASE_URL')
    } else if (error.code === '3D000') {
      console.error('\nDatabase "maxai" does not exist - create it with: createdb maxai')
    }
    
    process.exit(1)
  }
}

testConnection()
