import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { testId, answers, timeSpent } = body

    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const questions = test.questions as any[]
    let correctCount = 0

    questions.forEach((q: any) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / questions.length) * 100)

    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        testId,
        answers,
        score,
        completedAt: new Date(),
        timeSpent,
      },
    })

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Test attempt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
