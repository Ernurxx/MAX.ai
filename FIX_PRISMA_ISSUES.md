# Fix Prisma Client Installation Issues

## Current Problems

1. **TypeScript Error**: `Cannot find module '@prisma/client'`
2. **npm Offline Mode**: npm is set to `offline = true` in environment
3. **Network/Proxy Issue**: npm can't connect to registry (ECONNREFUSED)
4. **Prisma Generation Fails**: EPERM errors when generating Prisma Client

## Root Causes

- npm environment variable `offline = true` prevents package downloads
- Windows permission issues block Prisma Client generation
- Network/proxy configuration may be blocking npm registry access

## Solutions

### Solution 1: Fix npm Offline Mode (REQUIRED FIRST)

The npm environment has `offline = true` set, which prevents downloading packages.

**Step 1: Check environment variables**
```powershell
# Check if offline mode is set
$env:npm_config_offline
```

**Step 2: Unset offline mode**
```powershell
# In PowerShell (temporary for current session)
$env:npm_config_offline = $null

# Or remove from system environment variables permanently:
# 1. Open System Properties → Environment Variables
# 2. Find npm_config_offline in User/System variables
# 3. Delete it
```

**Step 3: Check proxy settings**
```powershell
npm config get proxy
npm config get https-proxy

# If proxy is set incorrectly, remove it:
npm config delete proxy
npm config delete https-proxy
```

### Solution 2: Install Prisma Packages

Once offline mode is fixed:

```powershell
cd C:\Users\User\Desktop\MAX.AI

# Install Prisma packages
npm install @prisma/client@5.7.0 prisma@5.7.0 --save-exact
```

### Solution 3: Generate Prisma Client (Run as Administrator)

After packages are installed, generate Prisma Client:

**Option A: Use the fix script (Recommended)**
```powershell
# Run PowerShell as Administrator
cd C:\Users\User\Desktop\MAX.AI
powershell -ExecutionPolicy Bypass -File scripts\fix-npm-and-prisma.ps1
```

**Option B: Manual steps**
```powershell
# 1. Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Wait for file locks to release
Start-Sleep -Seconds 3

# 3. Remove Prisma cache
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Generate Prisma Client
npm run db:generate
```

### Solution 4: If Still Failing - Windows Defender Exclusions

1. Open **Windows Security** → **Virus & threat protection**
2. Click **Manage settings** under Virus & threat protection settings
3. Scroll to **Exclusions** → **Add or remove exclusions**
4. Add these folder exclusions:
   - `C:\Users\User\Desktop\MAX.AI\node_modules`
   - `C:\Users\User\AppData\Local\npm-cache`

### Solution 5: Alternative - Use Yarn or pnpm

If npm continues to have issues:

```powershell
# Install yarn
npm install -g yarn

# Or install pnpm
npm install -g pnpm

# Then use yarn/pnpm instead:
yarn add @prisma/client@5.7.0 prisma@5.7.0 --exact
# OR
pnpm add @prisma/client@5.7.0 prisma@5.7.0 --save-exact

# Generate Prisma Client
yarn prisma generate
# OR
pnpm prisma generate
```

## Quick Fix Checklist

1. ✅ **Fix npm offline mode** (unset `npm_config_offline` environment variable)
2. ✅ **Fix proxy settings** (if applicable)
3. ✅ **Install Prisma packages**: `npm install @prisma/client@5.7.0 prisma@5.7.0 --save-exact`
4. ✅ **Stop Node processes** before generating
5. ✅ **Generate Prisma Client**: `npm run db:generate` (as Administrator if needed)
6. ✅ **Add Windows Defender exclusions** if generation still fails

## Verify Installation

After completing the steps above, verify:

```powershell
# Check if packages are installed
npm list @prisma/client prisma

# Check if Prisma Client exists
Test-Path "node_modules\@prisma\client\index.js"

# Should return: True
```

## Expected Result

After successful installation and generation:
- ✅ TypeScript error should disappear
- ✅ `node_modules/@prisma/client` folder should exist
- ✅ `node_modules/.prisma/client` folder should exist
- ✅ `npm run db:seed` should work

## Still Having Issues?

If problems persist:

1. **Check npm cache permissions**: The npm cache directory may need admin permissions
2. **Try a different terminal**: Use Command Prompt instead of PowerShell
3. **Restart your computer**: Sometimes file locks persist until reboot
4. **Check antivirus logs**: Some antivirus software blocks npm/Prisma operations

## Notes

- The `offline = true` setting is likely set in your system/user environment variables
- You may need to restart your terminal/IDE after changing environment variables
- Running as Administrator is often necessary for Prisma generation on Windows
