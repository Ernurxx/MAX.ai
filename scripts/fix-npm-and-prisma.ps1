# Fix npm cache and Prisma installation issues
# Run as Administrator: Right-click PowerShell → "Run as Administrator"

Write-Host "=== Fixing npm Cache and Prisma Installation ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue anyway (may fail)"
}

# Navigate to project directory
$projectPath = "C:\Users\User\Desktop\MAX.AI"
if (-not (Test-Path $projectPath)) {
    Write-Host "Error: Project path not found: $projectPath" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Step 1: Stop all Node processes
Write-Host "Step 1: Stopping all Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "  Stopping PID $($_.Id)..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✓ Stopped $($nodeProcesses.Count) Node process(es)" -ForegroundColor Green
} else {
    Write-Host "  ✓ No Node processes running" -ForegroundColor Green
}

# Step 2: Fix npm cache permissions
Write-Host ""
Write-Host "Step 2: Fixing npm cache permissions..." -ForegroundColor Yellow
$npmCachePath = "$env:APPDATA\npm-cache"
$npmCachePath2 = "$env:LOCALAPPDATA\npm-cache"

foreach ($cachePath in @($npmCachePath, $npmCachePath2)) {
    if (Test-Path $cachePath) {
        try {
            if ($isAdmin) {
                # Take ownership
                Start-Process -FilePath "takeown" -ArgumentList "/F `"$cachePath`" /R /D Y" -Wait -NoNewWindow -PassThru | Out-Null
                # Grant full control
                Start-Process -FilePath "icacls" -ArgumentList "`"$cachePath`" /grant ${env:USERNAME}:F /T" -Wait -NoNewWindow -PassThru | Out-Null
            }
            Write-Host "  ✓ Fixed permissions for: $cachePath" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠ Could not fix permissions for: $cachePath" -ForegroundColor Yellow
        }
    }
}

# Step 3: Clear npm cache
Write-Host ""
Write-Host "Step 3: Clearing npm cache..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "  ✓ npm cache cleared" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not clear npm cache (may not be necessary)" -ForegroundColor Yellow
}

# Step 4: Remove Prisma cache
Write-Host ""
Write-Host "Step 4: Removing Prisma cache..." -ForegroundColor Yellow
$prismaPaths = @(
    "node_modules\.prisma",
    "node_modules\@prisma"
)

foreach ($path in $prismaPaths) {
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✓ Removed: $path" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠ Could not remove: $path" -ForegroundColor Yellow
        }
    }
}

# Step 5: Install Prisma packages
Write-Host ""
Write-Host "Step 5: Installing Prisma packages..." -ForegroundColor Yellow
try {
    npm install @prisma/client@5.7.0 prisma@5.7.0 --save-exact
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Prisma packages installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install Prisma packages" -ForegroundColor Red
        Write-Host "    Try running: npm install --force" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  ✗ Error installing Prisma packages" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 6: Generate Prisma Client
Write-Host ""
Write-Host "Step 6: Generating Prisma Client..." -ForegroundColor Yellow
try {
    npm run db:generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ SUCCESS! Prisma Client generated." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
        Write-Host ""
        Write-Host "If this still fails:" -ForegroundColor Yellow
        Write-Host "1. Add Windows Defender exclusions for:" -ForegroundColor White
        Write-Host "   - $projectPath\node_modules" -ForegroundColor Gray
        Write-Host "   - C:\Users\User\AppData\Local\npm-cache" -ForegroundColor Gray
        Write-Host "2. Temporarily disable antivirus" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error generating Prisma Client" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
