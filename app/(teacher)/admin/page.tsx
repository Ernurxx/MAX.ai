'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/layout/LanguageProvider'
// Temporary: Use local type until Prisma Client is generated
type Subject = 'PHYSICS' | 'MATHEMATICS'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  subject: Subject
  order: number
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    if (session && session.user.role !== 'TEACHER') {
      router.push('/dashboard')
      return
    }

    fetch('/api/lessons')
      .then((res) => res.json())
      .then((data) => {
        setLessons(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, router])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return

    await fetch(`/api/lessons/${id}`, { method: 'DELETE' })
    setLessons(lessons.filter((l) => l.id !== id))
  }

  if (!session || session.user.role !== 'TEACHER') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <h1 className="text-2xl font-bold text-primary-600 flex items-center">
              MAX.AI - {t('teacher.title')}
            </h1>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Lessons</h2>
          <button
            onClick={() => {
              setEditingLesson(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus size={20} />
            {t('teacher.addLesson')}
          </button>
        </div>

        {showForm && (
          <LessonForm
            lesson={editingLesson}
            onClose={() => {
              setShowForm(false)
              setEditingLesson(null)
            }}
            onSave={() => {
              setShowForm(false)
              setEditingLesson(null)
              fetch('/api/lessons')
                .then((res) => res.json())
                .then(setLessons)
            }}
          />
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{lesson.subject}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingLesson(lesson)
                      setShowForm(true)
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Edit size={16} />
                    {t('teacher.editLesson')}
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                    {t('teacher.deleteLesson')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function LessonForm({
  lesson,
  onClose,
  onSave,
}: {
  lesson: Lesson | null
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle] = useState(lesson?.title || '')
  const [subject, setSubject] = useState<Subject>(
    lesson?.subject || 'PHYSICS'
  )
  const [content, setContent] = useState('')
  const [examples, setExamples] = useState<any[]>([])
  const [order, setOrder] = useState(lesson?.order || 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lesson) {
      fetch(`/api/lessons/${lesson.id}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title)
          setSubject(data.subject)
          setContent(data.content)
          setExamples(data.examples || [])
          setOrder(data.order)
        })
    }
  }, [lesson])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const url = lesson ? `/api/lessons/${lesson.id}` : '/api/lessons'
    const method = lesson ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        subject,
        content,
        examples,
        order,
      }),
    })

    setLoading(false)
    onSave()
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">
        {lesson ? 'Edit Lesson' : 'Add Lesson'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="PHYSICS">Physics</option>
            <option value="MATHEMATICS">Mathematics</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
