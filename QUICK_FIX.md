# Quick Fix Guide

## Problem: Can't see text when typing / No lessons/flashcards/tests showing

### Issue 1: Text not visible in input fields
**Fixed:** Added explicit text color to all input fields.

**If still not visible:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh: Ctrl+F5 or Ctrl+Shift+R
3. Check browser console (F12) for CSS errors

### Issue 2: No lessons, flashcards, or tests showing

This means the database is empty. You need to seed it:

**Steps:**
1. Make sure Prisma Client is generated:
   ```bash
   npm run db:generate
   ```

2. Push schema to database:
   ```bash
   npm run db:push
   ```

3. Seed the database with sample data:
   ```bash
   npm run db:seed
   ```

**After seeding, you should have:**
- ✅ 1 teacher account (teacher@max.ai / teacher123)
- ✅ 3 Physics lessons
- ✅ 3 Mathematics lessons  
- ✅ 12 flashcards (theorems and formulas)
- ✅ 4 practice tests (2 Physics, 2 Mathematics)

### Issue 3: Still can't see text

**Check:**
1. Open browser DevTools (F12)
2. Go to Console tab - look for errors
3. Go to Network tab - check if CSS files are loading
4. Check if Tailwind CSS is working:
   - Right-click on page → Inspect
   - Look at computed styles - should see Tailwind classes applied

**Quick test:**
- If you see the page layout but text is invisible → CSS issue
- If you see "No lessons available" → Database not seeded
- If page is completely blank → Server not running or build error

### Still having issues?

Check the terminal where `npm run dev` is running - it will show the actual error.
