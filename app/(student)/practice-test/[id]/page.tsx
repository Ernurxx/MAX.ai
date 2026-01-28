'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { useLanguage } from '@/components/layout/LanguageProvider'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface Test {
  id: string
  subject: string
  year: number
  questions: Question[]
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(3600) // 60 minutes in seconds
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetch(`/api/tests/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTest(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

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
        <div className="text-center py-12">Test not found</div>
      </StudentLayout>
    )
  }

  const questions = test.questions as Question[]
  const currentQ = questions[currentQuestion]

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
          <h2 className="text-xl font-semibold mb-6">{currentQ.question}</h2>
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

        <div className="flex justify-between">
          <button
            onClick={() =>
              setCurrentQuestion(Math.max(0, currentQuestion - 1))
            }
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded ${
                  answers[questions[idx].id] !== undefined
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200'
                } ${
                  currentQuestion === idx ? 'ring-2 ring-primary-600' : ''
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
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
    </StudentLayout>
  )
}
