import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getAITutorResponse(
  message: string,
  context?: {
    subject?: string
    currentPage?: string
    lessonTitle?: string
  }
): Promise<string> {
  const systemPrompt = `You are an AI Tutor for MAX.AI, helping students prepare for the Unified National Test (UNT) in Physics and Mathematics.

Your role is to:
- Answer questions clearly and helpfully
- Provide hints when students are stuck
- Explain concepts in a way that's easy to understand
- Encourage and motivate students
- Help with problem-solving strategies

${context?.subject ? `Current subject: ${context.subject}` : ''}
${context?.currentPage ? `Current page: ${context.currentPage}` : ''}
${context?.lessonTitle ? `Current lesson: ${context.lessonTitle}` : ''}

Be friendly, patient, and educational. If the student asks about something outside Physics or Mathematics, politely redirect them to these subjects.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'I apologize, but I encountered an error. Please try again later.'
  }
}
