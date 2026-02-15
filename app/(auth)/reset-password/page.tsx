'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/layout/LanguageProvider'
import PasswordInput from '@/components/ui/password-input'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang, t } = useLanguage()

  // Get token from URL hash (Supabase uses hash parameters)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Supabase sends token in URL hash
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    
    if (accessToken) {
      setToken(accessToken)
    } else {
      setError('Invalid or expired reset link')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!token) {
      setError('Invalid or expired reset link')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/supabase/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }

      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
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
            Enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
              Password reset successful! Redirecting to login...
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
            <PasswordInput
              label={`${t('auth.password')}*`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.enterPassword')}
            />

            <PasswordInput
              label={`${t('auth.confirmPassword')}*`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t('auth.confirmPasswordPlaceholder')}
            />

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : t('auth.resetPassword')}
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
