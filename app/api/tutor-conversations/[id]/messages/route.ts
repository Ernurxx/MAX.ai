import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getAITutorResponse } from '@/lib/openai'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params

    const conversation = await prisma.tutorConversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const messages = conversation.messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: m.createdAt,
    }))

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Fetch tutor messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const body = await req.json()
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    const context = body.context && typeof body.context === 'object' ? body.context : undefined

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    const conversation = await prisma.tutorConversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    await prisma.tutorMessage.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    })

    const history = conversation.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    history.push({ role: 'user' as const, content })

    const reply = await getAITutorResponse(content, context, history)

    const assistantMessage = await prisma.tutorMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: reply,
      },
    })

    const titleSnippet = content.slice(0, 50)
    if (conversation.title === 'New chat' && titleSnippet) {
      await prisma.tutorConversation.update({
        where: { id: conversationId },
        data: {
          title: titleSnippet + (content.length > 50 ? '...' : ''),
          updatedAt: new Date(),
        },
      })
    } else {
      await prisma.tutorConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      })
    }

    return NextResponse.json({
      reply,
      messageId: assistantMessage.id,
    })
  } catch (error) {
    console.error('Tutor message error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
