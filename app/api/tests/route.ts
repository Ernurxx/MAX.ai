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

    const tests = await prisma.test.findMany({
      where: subject ? { subject } : undefined,
      orderBy: { year: 'desc' },
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Tests API error:', error)
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
    const { subject, year, questions } = body

    const test = await prisma.test.create({
      data: {
        subject,
        year,
        questions: questions || [],
      },
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Create test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
