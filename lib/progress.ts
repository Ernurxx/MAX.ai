import { prisma } from './db'
// Temporary: Use local type until Prisma Client is generated
// Once Prisma Client is generated, change this back to: import { ActivityType } from '@prisma/client'
import { ActivityType } from '@/types/prisma'

export async function startStudySession(
  userId: string,
  activityType: ActivityType
) {
  return await prisma.studySession.create({
    data: {
      userId,
      activityType,
      startTime: new Date(),
    },
  })
}

export async function endStudySession(sessionId: string) {
  const session = await prisma.studySession.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.endTime) {
    return null
  }

  const endTime = new Date()
  const duration = Math.round(
    (endTime.getTime() - session.startTime.getTime()) / 60000
  ) // in minutes

  const updatedSession = await prisma.studySession.update({
    where: { id: sessionId },
    data: {
      endTime,
      duration,
    },
  })

  // Update progress
  await updateProgress(session.userId, duration)

  return updatedSession
}

async function updateProgress(userId: string, studyMinutes: number) {
  const progress = await prisma.progress.findUnique({
    where: { userId },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastStudyDate = progress?.lastStudyDate
    ? new Date(progress.lastStudyDate)
    : null

  const lastStudyDay = lastStudyDate
    ? new Date(lastStudyDate)
    : null
  lastStudyDay?.setHours(0, 0, 0, 0)

  const isToday = lastStudyDay?.getTime() === today.getTime()
  const isYesterday =
    lastStudyDay?.getTime() === today.getTime() - 24 * 60 * 60 * 1000

  let currentStreak = progress?.currentStreak || 0
  if (isToday) {
    // Same day, keep streak
  } else if (isYesterday) {
    // Consecutive day, increment streak
    currentStreak = (progress?.currentStreak || 0) + 1
  } else {
    // Streak broken, reset to 1
    currentStreak = 1
  }

  const longestStreak = Math.max(
    currentStreak,
    progress?.longestStreak || 0
  )

  await prisma.progress.upsert({
    where: { userId },
    update: {
      totalStudyTime: {
        increment: studyMinutes,
      },
      currentStreak,
      longestStreak,
      lastStudyDate: today,
    },
    create: {
      userId,
      totalStudyTime: studyMinutes,
      currentStreak,
      longestStreak,
      lastStudyDate: today,
    },
  })
}
