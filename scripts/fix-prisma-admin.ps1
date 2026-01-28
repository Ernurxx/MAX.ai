# Fix Prisma EPERM Error - Run as Administrator
# Right-click PowerShell → "Run as Administrator", then run this script

Write-Host "=== Prisma Permission Fix (Admin Mode) ===" -ForegroundColor Cyan
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

# Step 2: Wait for file locks to release
Write-Host ""
Write-Host "Step 2: Waiting for file locks to release..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 3: Remove Prisma cache and generated files
Write-Host ""
Write-Host "Step 3: Cleaning Prisma files..." -ForegroundColor Yellow

$pathsToRemove = @(
    "node_modules\.prisma",
    "node_modules\@prisma\client\.prisma"
)

foreach ($path in $pathsToRemove) {
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✓ Removed: $path" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to remove: $path" -ForegroundColor Red
            Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
}

# Step 4: Try to take ownership and set permissions (if admin)
if ($isAdmin) {
    Write-Host ""
    Write-Host "Step 4: Setting permissions on node_modules..." -ForegroundColor Yellow
    $nodeModulesPath = Join-Path $projectPath "node_modules"
    if (Test-Path $nodeModulesPath) {
        try {
            # Take ownership
            $takeown = Start-Process -FilePath "takeown" -ArgumentList "/F `"$nodeModulesPath`" /R /D Y" -Wait -NoNewWindow -PassThru
            # Grant full control
            $icacls = Start-Process -FilePath "icacls" -ArgumentList "`"$nodeModulesPath`" /grant ${env:USERNAME}:F /T" -Wait -NoNewWindow -PassThru
            Write-Host "  ✓ Permissions updated" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠ Could not update permissions (may not be necessary)" -ForegroundColor Yellow
        }
    }
}

# Step 5: Generate Prisma Client
Write-Host ""
Write-Host "Step 5: Generating Prisma Client..." -ForegroundColor Yellow
try {
    $env:PRISMA_SKIP_POSTINSTALL_GENERATE = "true"
    npm run db:generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ SUCCESS! Prisma Client generated." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Failed to generate Prisma Client (exit code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host ""
        Write-Host "If this still fails, try:" -ForegroundColor Yellow
        Write-Host "1. Add Windows Defender exclusions for:" -ForegroundColor White
        Write-Host "   - $projectPath\node_modules" -ForegroundColor Gray
        Write-Host "   - C:\Users\User\AppData\Local\npm-cache" -ForegroundColor Gray
        Write-Host "2. Temporarily disable antivirus" -ForegroundColor White
        Write-Host "3. Check if Controlled Folder Access is blocking access" -ForegroundColor White
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
