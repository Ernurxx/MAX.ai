'use client'

import { useEffect, useState } from 'react'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { useLanguage } from '@/components/layout/LanguageProvider'
import Link from 'next/link'
// Temporary: Use local type until Prisma Client is generated
// Once Prisma Client is generated, change this back to: import { Subject } from '@prisma/client'
import { Subject } from '@/types/prisma'

interface Lesson {
  id: string
  title: string
  subject: Subject
  order: number
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((data) => {
        setLessons(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredLessons = selectedSubject
    ? lessons.filter((l) => l.subject === selectedSubject)
    : lessons

  const physicsLessons = lessons.filter((l) => l.subject === 'PHYSICS')
  const mathLessons = lessons.filter((l) => l.subject === 'MATHEMATICS')

  return (
    <StudentLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('lessons.title')}
        </h1>

        <div className="flex gap-4">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSubject === null
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedSubject('PHYSICS')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSubject === 'PHYSICS'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('lessons.physics')}
          </button>
          <button
            onClick={() => setSelectedSubject('MATHEMATICS')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSubject === 'MATHEMATICS'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('lessons.mathematics')}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No lessons available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                <p className="text-sm text-gray-500">
                  {lesson.subject === 'PHYSICS'
                    ? t('lessons.physics')
                    : t('lessons.mathematics')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
