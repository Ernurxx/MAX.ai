import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { endStudySession } from '@/lib/progress'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const updatedSession = await endStudySession(sessionId)

    if (!updatedSession) {
      return NextResponse.json({ error: 'Session not found or already ended' }, { status: 404 })
    }

    return NextResponse.json({ success: true, duration: updatedSession.duration })
  } catch (error) {
    console.error('End study session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
