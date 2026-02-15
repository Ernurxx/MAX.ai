'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/layout/LanguageProvider'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { lang, t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/supabase/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email')
        return
      }

      setSuccess(true)
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
          <h1 className="text-4xl font-bold text-blue-600 mb-2">MAX.AI</h1>
          <h2 className="text-2xl font-semibold text-blue-600 mt-4">{t('auth.resetPassword')}</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
              Password reset link has been sent to your email. Please check your inbox.
            </div>
            <Link
              href="/login"
              className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('auth.backToLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder={t('auth.enterEmail')}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : t('auth.sendResetLink')}
            </button>

            <Link
              href="/login"
              className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('auth.backToLogin')}
            </Link>
          </form>
        )}

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
