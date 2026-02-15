'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { useLanguage } from '@/components/layout/LanguageProvider'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import { getLocalizedQuestion, type QuestionI18n } from '@/lib/practice-test-questions'
import type { Language } from '@/lib/i18n'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  imageUrl?: string
}

interface Test {
  id: string
  subject: string
  year: number
  questions: Question[] | QuestionI18n[]
  pdfUrl?: string | null
}

function normalizeQuestions(
  raw: Test['questions'],
  lang: Language
): Question[] {
  if (!Array.isArray(raw)) return []
  return raw.map((q: any) => {
    if (q.questionKk != null || q.questionRu != null) {
      const { question, options } = getLocalizedQuestion(q as QuestionI18n, lang)
      return {
        id: q.id,
        question,
        options,
        correctAnswer: q.correctAnswer,
        imageUrl: q.imageUrl,
      }
    }
    return q as Question
  })
}

export default function TestPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(3600) // 60 minutes in seconds
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [lastAttempt, setLastAttempt] = useState<{ score: number; completedAt: string } | null>(null)
  const { t, lang } = useLanguage()
  const questions: Question[] = useMemo(() => {
    if (!test) return []
    return normalizeQuestions(test.questions, lang)
  }, [test, lang])

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
            activityType: 'TEST',
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
    const id = params?.id
    if (!id) {
      setTest(null)
      setLoading(false)
      return
    }
    fetch(`/api/tests/${id}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setTest(null)
          setLoading(false)
          return
        }
        if (data?.error || !data?.id) {
          setTest(null)
          setLoading(false)
          return
        }
        setTest(data)
        setLoading(false)
      })
      .catch(() => {
        setTest(null)
        setLoading(false)
      })
  }, [params?.id])

  useEffect(() => {
    if (!test?.id || !session?.user?.id) return
    fetch('/api/test-attempts')
      .then((res) => res.json())
      .then((attempts: { testId: string; score: number; completedAt: string }[]) => {
        if (!Array.isArray(attempts)) return
        const forTest = attempts
          .filter((a) => a.testId === test.id)
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        if (forTest.length > 0 && forTest[0].score != null) {
          setLastAttempt({ score: forTest[0].score, completedAt: forTest[0].completedAt })
        }
      })
      .catch(() => {})
  }, [test?.id, session?.user?.id])

  useEffect(() => {
    if (timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining, submitted])

  const handleSubmit = async () => {
    if (!test) return

    const timeSpent = 3600 - timeRemaining

    const response = await fetch('/api/test-attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testId: test.id,
        answers,
        timeSpent,
      }),
    })

    const result = await response.json()
    setResults(result)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="text-center py-12">Loading...</div>
      </StudentLayout>
    )
  }

  if (!test) {
    return (
      <StudentLayout>
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-600">Test not found</p>
          <Link
            href="/practice-test"
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Practice Tests
          </Link>
        </div>
      </StudentLayout>
    )
  }

  const currentQ = questions[currentQuestion]

  if (questions.length === 0) {
    return (
      <StudentLayout>
        <div className="text-center py-12">This test has no questions yet.</div>
      </StudentLayout>
    )
  }

  if (submitted && results) {
    const correctCount = questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-6">{t('test.results')}</h1>
            <div className="text-4xl font-bold text-primary-600 mb-4">
              {results.score}%
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={20} />
                <span>
                  {correctCount} {t('test.correct')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle size={20} />
                <span>
                  {questions.length - correctCount} {t('test.incorrect')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {lastAttempt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            Your last result: {lastAttempt.score}% ({new Date(lastAttempt.completedAt).toLocaleDateString()})
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {test.subject} {t('test.year')} {test.year}
          </h1>
          <div className="text-lg font-medium">
            {t('test.timeRemaining')}: {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-4 text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <h2 className="text-xl font-semibold mb-4">{currentQ.question}</h2>
          {currentQ.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={currentQ.imageUrl}
                alt=""
                className="w-full max-w-lg mx-auto block object-contain"
              />
            </div>
          )}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setAnswers({ ...answers, [currentQ.id]: idx })
                }
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  answers[currentQ.id] === idx
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {String.fromCharCode(65 + idx)}. {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5 justify-center min-h-[52px] items-center">
            {questions.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentQuestion(idx)}
                className={`min-w-[2.25rem] h-9 px-2 rounded text-sm font-medium transition-colors ${
                  answers[questions[idx].id] !== undefined
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${
                  currentQuestion === idx
                    ? 'ring-2 ring-primary-600 ring-offset-2'
                    : ''
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(questions.length - 1, currentQuestion + 1)
                  )
                }
                className="px-6 py-3 bg-white rounded-lg shadow hover:bg-gray-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {t('test.submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
