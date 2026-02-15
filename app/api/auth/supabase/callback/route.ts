import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    if (!code) {
      return NextResponse.redirect(
        new URL(`/login?error=missing_code`, request.url)
      )
    }

    // Exchange code for session
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError || !authData.user) {
      return NextResponse.redirect(
        new URL(`/login?error=auth_failed`, request.url)
      )
    }

    const email = authData.user.email
    if (!email) {
      return NextResponse.redirect(
        new URL(`/login?error=no_email`, request.url)
      )
    }

    // Get or create user in Prisma database
    const userName = authData.user.user_metadata?.name || email.split('@')[0]
    const userRole = authData.user.user_metadata?.role || 'STUDENT'

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        email,
        name: userName,
        supabaseId: authData.user.id,
        lastLoginAt: new Date(),
      },
      create: {
        email,
        name: userName,
        role: userRole,
        supabaseId: authData.user.id,
        lastLoginAt: new Date(),
      },
    })

    // Create progress record for students
    if (user.role === 'STUDENT') {
      await prisma.progress.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
        },
      })
    }

    // Store session in cookies or redirect to NextAuth sign-in
    // For now, redirect to login with a success message
    // In production, you'd want to create a NextAuth session here
    return NextResponse.redirect(
      new URL(`/login?supabaseAuth=true&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=callback_error`, request.url)
    )
  }
}
