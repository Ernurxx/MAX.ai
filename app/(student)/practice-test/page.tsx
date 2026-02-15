'use client'

import { useEffect, useState } from 'react'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { useLanguage } from '@/components/layout/LanguageProvider'
// Temporary: Use local type until Prisma Client is generated
// Once Prisma Client is generated, change this back to: import { Subject } from '@prisma/client'
import { Subject } from '@/types/prisma'
import Link from 'next/link'

interface TestAttempt {
  id: string
  score: number
  completedAt: string
  timeSpent: number
}

interface Test {
  id: string
  subject: Subject
  year: number
  lastAttempt?: TestAttempt | null
}

export default function PracticeTestPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    Promise.all([
      fetch('/api/tests').then((res) => res.json()),
      fetch('/api/test-attempts').then((res) => res.json())
    ])
      .then(([testsData, attemptsData]) => {
        const attempts = Array.isArray(attemptsData) ? attemptsData : []
        // Map last attempt to each test
        const testsWithAttempts = (Array.isArray(testsData) ? testsData : []).map((test: Test) => {
          const lastAttempt = attempts
            .filter((a: any) => a.testId === test.id)
            .sort((a: any, b: any) => 
              new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            )[0]
          return { ...test, lastAttempt }
        })
        setTests(testsWithAttempts)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredTests = selectedSubject
    ? tests.filter((t) => t.subject === selectedSubject)
    : tests

  return (
    <StudentLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('test.title')}</h1>

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
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tests available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Link
                key={test.id}
                href={`/practice-test/${test.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {test.subject === 'PHYSICS'
                    ? t('lessons.physics')
                    : t('lessons.mathematics')}{' '}
                  {t('test.year')} {test.year}
                </h3>
                
                {test.lastAttempt && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium">
                      Last Result: {test.lastAttempt.score}%
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {new Date(test.lastAttempt.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {test.lastAttempt ? 'Retake Test' : t('test.start')}
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
