import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword, name, lastName, role } = await request.json()

    // Validation
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Email, password, and confirmation are required' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          lastName: lastName || '',
          role: role || 'STUDENT',
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user in Prisma database
    const userRole = role === 'TEACHER' ? 'TEACHER' : 'STUDENT'

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        email,
        name: name,
        lastName: lastName || null,
        role: userRole,
        supabaseId: authData.user.id,
      },
      create: {
        email,
        name: name,
        lastName: lastName || null,
        role: userRole,
        supabaseId: authData.user.id,
        lastLoginAt: new Date(),
      },
    })

    // Create progress record for students
    if (userRole === 'STUDENT') {
      await prisma.progress.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
