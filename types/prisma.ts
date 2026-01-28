// Temporary type definitions until Prisma Client is generated
// Using string literal unions for better TypeScript compatibility
export type UserRole = 'STUDENT' | 'TEACHER'
export const UserRole = {
  STUDENT: 'STUDENT' as UserRole,
  TEACHER: 'TEACHER' as UserRole,
}

export type Subject = 'PHYSICS' | 'MATHEMATICS'
export const Subject = {
  PHYSICS: 'PHYSICS' as Subject,
  MATHEMATICS: 'MATHEMATICS' as Subject,
}

export type FlashcardCategory = 'THEOREM' | 'FORMULA'
export const FlashcardCategory = {
  THEOREM: 'THEOREM' as FlashcardCategory,
  FORMULA: 'FORMULA' as FlashcardCategory,
}

export type ActivityType = 'LESSON' | 'FLASHCARD' | 'TEST' | 'OTHER'
export const ActivityType = {
  LESSON: 'LESSON' as ActivityType,
  FLASHCARD: 'FLASHCARD' as ActivityType,
  TEST: 'TEST' as ActivityType,
  OTHER: 'OTHER' as ActivityType,
}

// Temporary PrismaClient type until Prisma Client is generated
// This is a minimal stub - the actual PrismaClient will be available after running: npm run db:generate
export class PrismaClient {
  constructor() {
    throw new Error(
      'Prisma Client has not been generated. Please run: npm run db:generate'
    )
  }
}
