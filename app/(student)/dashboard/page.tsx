'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { useLanguage } from '@/components/layout/LanguageProvider'
import { format } from 'date-fns'

interface ProgressData {
  lastLogin: string | null
  totalStudyTime: number
  currentStreak: number
  longestStreak: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/progress?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProgress(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </StudentLayout>
    )
  }

  const hours = Math.floor((progress?.totalStudyTime || 0) / 60)
  const minutes = (progress?.totalStudyTime || 0) % 60

  return (
    <StudentLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('progress.title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t('progress.lastLogin')}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {progress?.lastLogin
                ? format(new Date(progress.lastLogin), 'MMM d, yyyy')
                : 'Never'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t('progress.studyTime')}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {hours > 0 && `${hours} ${t('progress.hours')} `}
              {minutes} {t('progress.minutes')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t('progress.currentStreak')}
            </h3>
            <p className="text-2xl font-bold text-primary-600">
              {progress?.currentStreak || 0} {t('progress.days')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t('progress.longestStreak')}
            </h3>
            <p className="text-2xl font-bold text-primary-600">
              {progress?.longestStreak || 0} {t('progress.days')}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
          <p className="text-gray-600">
            Continue your learning journey by exploring lessons, practicing with
            flashcards, or taking a practice test.
          </p>
        </div>
      </div>
    </StudentLayout>
  )
}
