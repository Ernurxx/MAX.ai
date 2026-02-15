// Test OpenAI API key and check rate limits
require('dotenv').config()
const OpenAI = require('openai')

async function testOpenAI() {
  console.log('\n=== Testing OpenAI API Key ===\n')
  
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env')
    return
  }
  
  console.log('✓ API Key found:', apiKey.substring(0, 20) + '...' + apiKey.slice(-10))
  
  const openai = new OpenAI({ apiKey })
  
  // Test 1: List models
  console.log('\nTest 1: Checking API key validity...')
  try {
    const models = await openai.models.list()
    console.log('✓ API key is VALID')
    console.log('  Available models:', models.data.slice(0, 3).map(m => m.id).join(', '), '...')
  } catch (error) {
    console.error('❌ API key validation failed')
    console.error('Error:', error.message)
    if (error.status === 401) {
      console.error('\n⚠️  API key is INVALID or REVOKED')
      console.error('   Solution: Create new API key at https://platform.openai.com/api-keys')
    }
    return
  }
  
  // Test 2: Check rate limits with actual request
  console.log('\nTest 2: Testing chat completion...')
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello" in one word.' }
      ],
      max_tokens: 10,
    })
    
    console.log('✓ Chat completion SUCCESSFUL')
    console.log('  Response:', completion.choices[0]?.message?.content)
    console.log('  Model used:', completion.model)
    console.log('\n✅ AI Tutor should work! No rate limit issues detected.')
    
  } catch (error) {
    console.error('❌ Chat completion FAILED')
    console.error('Error:', error.message)
    
    if (error.status === 429) {
      console.error('\n⚠️  RATE LIMIT ERROR CONFIRMED')
      console.error('   Status: 429 - Too Many Requests')
      console.error('\n   Possible causes:')
      console.error('   1. Account is still on Free/Tier 1 (very low limits)')
      console.error('   2. Daily quota exceeded')
      console.error('   3. Too many requests in last minute')
      console.error('\n   Solutions:')
      console.error('   • Check your tier: https://platform.openai.com/account/limits')
      console.error('   • Check usage: https://platform.openai.com/usage')
      console.error('   • Wait 5-10 minutes and try again')
      console.error('   • Verify $5 payment processed at https://platform.openai.com/account/billing')
    } else if (error.status === 401) {
      console.error('\n⚠️  AUTHENTICATION ERROR')
      console.error('   API key might be invalid or revoked')
      console.error('   Create new key: https://platform.openai.com/api-keys')
    } else if (error.status === 403) {
      console.error('\n⚠️  ACCESS DENIED')
      console.error('   Your account might not have access to this model')
      console.error('   Check billing: https://platform.openai.com/account/billing')
    } else {
      console.error('\n⚠️  Unknown error:', error.status)
      console.error('   Full error:', JSON.stringify(error, null, 2))
    }
  }
  
  // Test 3: Check account info
  console.log('\n=== Next Steps ===\n')
  console.log('1. Check your OpenAI tier and limits:')
  console.log('   https://platform.openai.com/account/limits')
  console.log('')
  console.log('2. Check your balance:')
  console.log('   https://platform.openai.com/usage')
  console.log('')
  console.log('3. Check billing status:')
  console.log('   https://platform.openai.com/account/billing')
  console.log('')
}

testOpenAI().catch(console.error)
