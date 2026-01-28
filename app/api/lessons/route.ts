import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
// Temporary: Use local type until Prisma Client is generated
// Once Prisma Client is generated, change this back to: import { Subject } from '@prisma/client'
import { Subject } from '@/types/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subject = req.nextUrl.searchParams.get('subject') as Subject | null

    const lessons = await prisma.lesson.findMany({
      where: subject ? { subject } : undefined,
      orderBy: { order: 'asc' },
      include: {
        createdByUser: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Lessons API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, subject, content, examples, order } = body

    const lesson = await prisma.lesson.create({
      data: {
        title,
        subject,
        content,
        examples: examples || [],
        order: order || 0,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Create lesson error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
