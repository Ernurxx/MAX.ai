# Troubleshooting "localhost sent an invalid response"

## Common Causes and Solutions

### 1. Missing or Invalid NEXTAUTH_SECRET

**Problem:** NextAuth requires a proper secret key.

**Solution:** Generate a secure secret:
```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

Or use OpenSSL (if installed):
```bash
openssl rand -base64 32
```

Update `.env` with the generated secret.

### 2. Prisma Client Not Generated

**Problem:** Database queries fail because Prisma Client isn't generated.

**Common Errors:**
- `EPERM: operation not permitted, rename` - File is locked by another process
- `spawn EPERM` - Windows permission/antivirus blocking

**Solution 1: Stop all Node processes and retry**
```powershell
# Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Remove Prisma cache
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

# Generate Prisma Client
npm run db:generate
```

**Solution 2: Run as Administrator (if Solution 1 fails)**
1. Close Cursor/VS Code completely
2. Right-click PowerShell → "Run as Administrator"
3. Navigate to project: `cd C:\Users\User\Desktop\MAX.AI`
4. Run: `npm run db:generate`

**Solution 3: Add Windows Defender Exclusions (if still failing)**
1. Open Windows Security → Virus & threat protection
2. Click "Manage settings" under Virus & threat protection settings
3. Scroll to "Exclusions" → "Add or remove exclusions"
4. Add folder exclusion: `C:\Users\User\Desktop\MAX.AI\node_modules`
5. Add folder exclusion: `C:\Users\User\AppData\Local\npm-cache`
6. Try `npm run db:generate` again

**Solution 4: Use the fix script**
```powershell
# Run the provided fix script
powershell -ExecutionPolicy Bypass -File scripts\fix-prisma-now.ps1
```

### 3. Database Connection Issues

**Problem:** Can't connect to PostgreSQL.

**Check:**
- Is PostgreSQL running?
- Is the database `maxai` created?
- Are credentials in `.env` correct?

**Solution:**
```bash
# Test connection
npm run db:push
```

### 4. Server Crash on Startup

**Check the terminal** where you ran `npm run dev` for error messages.

Common errors:
- Missing environment variables
- Database connection failures
- Import errors
- Type errors

### 5. Port Already in Use

**Problem:** Port 3000 is already in use.

**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### 6. Build Cache Issues

**Solution:**
```bash
# Clean and rebuild
npm run clean
npm run dev
```

### 7. Missing Dependencies

**Solution:**
```bash
npm install
npm run db:generate
```

## Quick Fix Checklist

1. ✅ Check `.env` file exists and has all required variables
2. ✅ Generate Prisma Client: `npm run db:generate`
3. ✅ Verify database is running and accessible
4. ✅ Check terminal for error messages
5. ✅ Clear browser cache and cookies
6. ✅ Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

## Getting More Information

Check the terminal output when running `npm run dev` - it will show the actual error causing the invalid response.
