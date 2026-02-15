import OpenAI from 'openai'
import path from 'path'

// Use only the project's .env / .env.local (never Cursor/IDE-injected keys)
function getProjectOpenAIKey(): string {
  if (typeof window !== 'undefined') return ''
  try {
    const dotenv = require('dotenv')
    const cwd = process.cwd()
    dotenv.config({ path: path.join(cwd, '.env'), override: true })
    dotenv.config({ path: path.join(cwd, '.env.local'), override: true })
  } catch {
    // dotenv optional; process.env already loaded by Next.js
  }
  return (process.env.OPENAI_API_KEY ?? '').trim()
}

const apiKey = getProjectOpenAIKey()
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in .env or .env.local')
}

export const openai = new OpenAI({
  apiKey,
})

// Validate OpenAI API key at startup
export async function validateOpenAIKey(): Promise<boolean> {
  try {
    await openai.models.list()
    console.log('✓ OpenAI API key is valid')
    return true
  } catch (error) {
    console.error('✗ OpenAI API key validation failed:', error)
    return false
  }
}

export async function getAITutorResponse(
  message: string,
  context?: {
    subject?: string
    currentPage?: string
    lessonTitle?: string
  },
  history?: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const systemPrompt = `You are an AI Tutor for MAX.AI, helping students prepare for the Unified National Test (UNT) in Physics and Mathematics.

Your role is to:
- Answer questions clearly and helpfully
- Provide hints when students are stuck
- Explain concepts in a way that's easy to understand
- Encourage and motivate students
- Help with problem-solving strategies

Format your answers so they are easy to read:
- Use clear, simple language. Avoid raw LaTeX like \\log_3 9; write "log base 3 of 9" or use inline math in $...$ only when needed.
- Use short numbered steps when solving problems, without heavy markdown.
- Prefer plain sentences and line breaks over complex formatting so students can follow easily.

${context?.subject ? `Current subject: ${context.subject}` : ''}
${context?.currentPage ? `Current page: ${context.currentPage}` : ''}
${context?.lessonTitle ? `Current lesson: ${context.lessonTitle}` : ''}

Be friendly, patient, and educational. If the student asks about something outside Physics or Mathematics, politely redirect them to these subjects.`

  const chatMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...(history && history.length > 0
      ? history.map((m) => ({ role: m.role, content: m.content }))
      : [{ role: 'user' as const, content: message }]),
  ]

  const inputItems = history && history.length > 0
    ? history.map((m) => ({ role: m.role, content: m.content }))
    : [{ role: 'user' as const, content: message }]

  // Prefer Responses API with GPT-5 mini. Fallback to Chat Completions.
  try {
    console.log('Attempting AI response with Responses API (gpt-5-mini)')
    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      input: inputItems,
      instructions: systemPrompt,
      temperature: 0.7,
      max_output_tokens: 500,
    })

    const text = (response as { output_text?: string }).output_text
    if (text && text.trim()) {
      console.log('✓ Successfully got response from gpt-5-mini (Responses API)')
      return text.trim()
    }
  } catch (error) {
    console.error('Responses API (gpt-5-mini) failed, falling back to Chat Completions:', error)
  }

  // Fallback: Chat Completions API
  const models = ['gpt-4o-mini', 'gpt-3.5-turbo']
  for (let i = 0; i < models.length; i++) {
    const model = models[i]
    try {
      console.log(`Attempting AI response with model: ${model}`)
      const completion = await openai.chat.completions.create({
        model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 500,
      })

      const response = completion.choices[0]?.message?.content
      if (response) {
        console.log(`✓ Successfully got response from ${model}`)
        return response
      }
      return 'I apologize, but I could not generate a response. Please try again.'
    } catch (error) {
      console.error(`Failed with model ${model}:`, error)
      if (error && typeof error === 'object' && 'status' in error) {
        const openAIError = error as { status?: number; message?: string }
        if (openAIError.status === 401) {
          return 'OpenAI API key is invalid or expired. Please check OPENAI_API_KEY in your .env or .env.local file and ensure you have a valid key from https://platform.openai.com/api-keys'
        }
        if (openAIError.status === 429) {
          return 'API rate limit reached. Please try again in a moment.'
        }
        if (openAIError.status === 500) {
          return 'OpenAI service is temporarily unavailable. Please try again later.'
        }
      }
      if (i < models.length - 1) continue
      return 'I apologize, but I encountered an error. Please try again later.'
    }
  }

  return 'I apologize, but I encountered an error. Please try again later.'
}
