'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/layout/LanguageProvider'

export default function LoginPage() {
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { lang, t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        redirect: false,
        name: role === 'STUDENT' ? name : undefined,
        email: role === 'TEACHER' ? email : undefined,
        password: role === 'TEACHER' ? password : undefined,
        role,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        if (role === 'STUDENT') {
          router.push('/dashboard')
        } else {
          router.push('/admin')
        }
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">MAX.AI</h1>
          <p className="text-gray-600">{t('auth.welcome')}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setRole('STUDENT')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              role === 'STUDENT'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('auth.student')}
          </button>
          <button
            onClick={() => setRole('TEACHER')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              role === 'TEACHER'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('auth.teacher')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'STUDENT' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                placeholder={t('auth.name')}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  placeholder={t('auth.email')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  placeholder={t('auth.password')}
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : t('auth.login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <select
            value={lang}
            onChange={(e) => {
              const newLang = e.target.value as 'en' | 'kk' | 'ru'
              localStorage.setItem('language', newLang)
              window.location.reload()
            }}
            className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1"
          >
            <option value="en">English</option>
            <option value="kk">Қазақша</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </div>
    </div>
  )
}
