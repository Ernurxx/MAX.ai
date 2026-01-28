import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
// Temporary: Use local types until Prisma Client is generated
// Once Prisma Client is generated, change this back to: import { Subject, FlashcardCategory } from '@prisma/client'
import { Subject, FlashcardCategory } from '@/types/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subject = req.nextUrl.searchParams.get('subject') as Subject | null
    const category = req.nextUrl.searchParams.get(
      'category'
    ) as FlashcardCategory | null

    const flashcards = await prisma.flashcard.findMany({
      where: {
        ...(subject && { subject }),
        ...(category && { category }),
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error('Flashcards API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
