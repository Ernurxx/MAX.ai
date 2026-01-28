import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
// Temporary: Use local type until Prisma Client is generated
// Once Prisma Client is generated, change this back to: import { UserRole } from '@prisma/client'
type UserRole = 'STUDENT' | 'TEACHER'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null

        // Teacher login with email/password
        if (credentials.role === 'TEACHER') {
          if (!credentials.email || !credentials.password) return null

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || user.role !== 'TEACHER') return null

          if (!user.passwordHash) return null

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isValid) return null

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        }

        // Student login with name
        if (credentials.role === 'STUDENT') {
          if (!credentials.name) return null

          let user = await prisma.user.findFirst({
            where: {
              name: credentials.name,
              role: 'STUDENT',
            },
          })

          // Create student if doesn't exist (registration)
          if (!user) {
            user = await prisma.user.create({
              data: {
                name: credentials.name,
                role: 'STUDENT',
                lastLoginAt: new Date(),
              },
            })

            // Create progress record for new student
            await prisma.progress.create({
              data: {
                userId: user.id,
              },
            })
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}
