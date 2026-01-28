# MAX.AI Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your database URL, NextAuth secret, and OpenAI API key

3. **Set Up Database**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Create database tables
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open http://localhost:3000
   - Login as teacher: `teacher@max.ai` / `teacher123`
   - Or login as student: Enter any name

## Database Setup

### PostgreSQL Setup

1. Install PostgreSQL if not already installed
2. Create a new database:
   ```sql
   CREATE DATABASE maxai;
   ```
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/maxai?schema=public"
   ```

### Running Migrations

If you need to create migrations:
```bash
npm run db:migrate
```

### Seeding Data

The seed script creates:
- 1 teacher account (teacher@max.ai / teacher123)
- 3 Physics lessons
- 3 Mathematics lessons
- 12 flashcards (theorems and formulas)
- 4 practice tests (2 Physics, 2 Mathematics)

To re-seed:
```bash
npm run db:seed
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL (http://localhost:3000 for dev)
- `NEXTAUTH_SECRET`: Secret key for NextAuth (generate with `openssl rand -base64 32`)
- `OPENAI_API_KEY`: OpenAI API key for AI Tutor

## Features

### Student Features
- **Dashboard**: View progress, study time, and streaks
- **Lessons**: Browse and study Physics and Mathematics
- **Flashcards**: Study with interactive flip cards
- **Practice Tests**: Take timed UNT-style tests
- **AI Tutor**: Get help from AI assistant

### Teacher Features
- **Admin Panel**: Manage lessons
- **Create/Edit Lessons**: Add content with examples
- **Delete Lessons**: Remove outdated content

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your app URL
- Clear browser cookies if needed

### OpenAI API Issues
- Verify OPENAI_API_KEY is valid
- Check API quota/limits
- AI Tutor will show error message if API fails

## Production Deployment

1. Set up production database
2. Update environment variables
3. Run migrations: `npm run db:migrate`
4. Seed initial data: `npm run db:seed`
5. Build: `npm run build`
6. Start: `npm start`

## Support

For issues or questions, please check the README.md or contact support.
