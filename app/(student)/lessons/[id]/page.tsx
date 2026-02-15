'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { useLanguage } from '@/components/layout/LanguageProvider'
import ReactMarkdown from 'react-markdown'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  subject: string
  content: string
  examples: any[]
  order: number
}

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { t } = useLanguage()

  // Start study session when component mounts
  useEffect(() => {
    if (!session?.user?.id) return

    const startSession = async () => {
      try {
        const response = await fetch('/api/study-session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            activityType: 'LESSON',
          }),
        })
        const data = await response.json()
        if (data.sessionId) {
          setSessionId(data.sessionId)
        }
      } catch (error) {
        console.error('Failed to start study session:', error)
      }
    }

    startSession()

    // End study session when component unmounts
    return () => {
      if (sessionId) {
        fetch('/api/study-session/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(console.error)
      }
    }
  }, [session?.user?.id])

  useEffect(() => {
    Promise.all([
      fetch(`/api/lessons/${params.id}`).then((res) => res.json()),
      fetch('/api/lessons').then((res) => res.json()),
    ])
      .then(([lessonData, allLessonsData]) => {
        setLesson(lessonData)
        setAllLessons(allLessonsData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <StudentLayout>
        <div className="text-center py-12">Loading...</div>
      </StudentLayout>
    )
  }

  if (!lesson) {
    return (
      <StudentLayout>
        <div className="text-center py-12">Lesson not found</div>
      </StudentLayout>
    )
  }

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <div className="prose max-w-none">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>

          {lesson.examples && lesson.examples.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">
                {t('lessons.examples')}
              </h2>
              {lesson.examples.map((example, idx) => (
                <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  {example.question && (
                    <p className="font-medium mb-2">{example.question}</p>
                  )}
                  {example.solution && (
                    <div className="prose">
                      <ReactMarkdown>{example.solution}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => prevLesson && router.push(`/lessons/${prevLesson.id}`)}
            disabled={!prevLesson}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            {t('lessons.previous')}
          </button>
          <button
            onClick={() => nextLesson && router.push(`/lessons/${nextLesson.id}`)}
            disabled={!nextLesson}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('lessons.next')}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </StudentLayout>
  )
}
