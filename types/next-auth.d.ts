// Temporary: Use local type until Prisma Client is generated
// Once Prisma Client is generated, change this back to: import { UserRole } from '@prisma/client'
type UserRole = 'STUDENT' | 'TEACHER'

import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: UserRole
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
