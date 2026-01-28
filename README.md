# MAX.AI - UNT Preparation Website

A comprehensive learning platform for preparing for the Unified National Test (UNT) with AI-powered tutoring, interactive lessons, flashcards, and practice tests.

## Features

- **Student Dashboard**: Track progress, study time, and streaks
- **Lessons**: Detailed Physics and Mathematics lessons with examples
- **Flashcards**: Interactive flashcards for theorems and formulas
- **Practice Tests**: Real UNT-style tests from previous years
- **AI Tutor**: Get help and explanations from an AI-powered tutor
- **Teacher Panel**: Manage and edit lessons
- **Multilingual**: Support for English, Kazakh, and Russian

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **AI**: OpenAI API
- **Animations**: Framer Motion

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MAX.AI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/maxai?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
OPENAI_API_KEY="your-openai-api-key-here"
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Accounts

### Teacher Account
- Email: `teacher@max.ai`
- Password: `teacher123`

### Student Account
Students can register by simply entering their name on the login page.

## Project Structure

```
MAX.AI/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (student)/         # Student pages
│   ├── (teacher)/         # Teacher pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ai-tutor/         # AI Tutor components
│   └── layout/           # Layout components
├── lib/                   # Utilities and configurations
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create migration
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Features in Detail

### Student Features
- **My Progress**: View last login, total study time, and streaks
- **Lessons**: Browse and study Physics and Mathematics lessons
- **Flashcards**: Study theorems and formulas with flip animations
- **Practice Tests**: Take timed tests with real UNT questions
- **AI Tutor**: Chat with AI for help and explanations

### Teacher Features
- **Lesson Management**: Create, edit, and delete lessons
- **Content Creation**: Add detailed content with examples

## Database Schema

The application uses the following main models:
- **User**: Students and teachers
- **Lesson**: Educational content
- **Flashcard**: Study cards for theorems and formulas
- **Test**: Practice tests
- **TestAttempt**: Student test submissions
- **StudySession**: Track study sessions
- **Progress**: Track student progress and streaks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.
