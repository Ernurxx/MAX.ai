# Complete Fix Guide for MAX.AI

## Current Issues Summary
1. ❌ Prisma Client can't generate (EPERM error - file locked)
2. ❌ Browser shows "invalid response" (server crashes because Prisma Client missing)
3. ❌ Can't see text when typing (CSS issue - already fixed)
4. ❌ No lessons/flashcards/tests (database not seeded)

## Step-by-Step Solution

### STEP 1: Fix Prisma Client Generation (CRITICAL)

**Option A: Restart Computer (Easiest)**
1. Save all your work
2. Restart your computer (this releases all file locks)
3. After restart, open PowerShell
4. Navigate to project: `cd C:\Users\User\Desktop\MAX.AI`
5. Run: `npm run db:generate`
6. If successful, continue to Step 2

**Option B: Manual Process Kill (If restart not possible)**
1. Close Cursor/VS Code completely
2. Open Task Manager (Ctrl+Shift+Esc)
3. Go to "Details" tab
4. Find ALL `node.exe` processes
5. Right-click each → End Task
6. Also end any `Code.exe` or `Cursor.exe` processes
7. Wait 10 seconds
8. Open PowerShell as Administrator
9. Run:
   ```powershell
   cd C:\Users\User\Desktop\MAX.AI
   Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
   Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
   npm run db:generate
   ```

### STEP 2: Set Up Database

Once Prisma Client is generated:

```powershell
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### STEP 3: Start the Server

```powershell
npm run dev
```

### STEP 4: Test in Browser

1. Open browser (use incognito/private window to avoid cache issues)
2. Go to: http://localhost:3000
3. You should see the login page
4. Try logging in as:
   - Student: Enter any name
   - Teacher: teacher@max.ai / teacher123

## If Prisma Still Fails After Restart

### Add Windows Defender Exclusion

1. Open Windows Security
2. Virus & threat protection → Manage settings
3. Exclusions → Add or remove exclusions
4. Add folder: `C:\Users\User\Desktop\MAX.AI\node_modules`
5. Add folder: `C:\Users\User\AppData\Local\npm-cache`
6. Try `npm run db:generate` again

### Alternative: Use SQLite for Development

If PostgreSQL keeps causing issues, switch to SQLite temporarily:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="file:./dev.db"
   ```

3. Run:
   ```powershell
   npm run db:push
   npm run db:seed
   npm run dev
   ```

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run db:generate` completes without errors
- [ ] `npm run db:push` shows "Database synchronized"
- [ ] `npm run db:seed` shows "Seed completed!"
- [ ] `npm run dev` shows "Ready" message
- [ ] Browser loads http://localhost:3000 without errors
- [ ] Login page displays correctly
- [ ] Can type in input fields (text is visible)
- [ ] After login, can see dashboard
- [ ] Lessons page shows lessons (after seeding)
- [ ] Flashcards page shows cards (after seeding)
- [ ] Practice Test page shows tests (after seeding)

## Quick Status Check

Run these commands to check status:

```powershell
# Check if Prisma Client exists
Test-Path "node_modules\.prisma\client"

# Check if database is seeded (should return count > 0)
# This requires Prisma Client to be generated first
```

## Need Help?

If you're still stuck:
1. Check terminal output when running `npm run dev` - it shows the actual error
2. Check browser console (F12) for JavaScript errors
3. Verify PostgreSQL is running (if using PostgreSQL)
4. Make sure `.env` file exists and has correct values
