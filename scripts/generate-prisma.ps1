# Generate Prisma Client - Run this after restarting computer
# This script will handle the Prisma Client generation

Write-Host "=== Prisma Client Generation Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "ERROR: node_modules folder not found!" -ForegroundColor Red
    Write-Host "Run 'npm install' first" -ForegroundColor Yellow
    exit 1
}

# Step 2: Stop any running Node processes
Write-Host "Step 1: Checking for running Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Found $($nodeProcesses.Count) Node process(es) - stopping them..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Stopped" -ForegroundColor Green
} else {
    Write-Host "  ✓ No Node processes running" -ForegroundColor Green
}

# Step 3: Remove Prisma cache if it exists
Write-Host ""
Write-Host "Step 2: Cleaning Prisma cache..." -ForegroundColor Yellow
$prismaPath = "node_modules\.prisma"
if (Test-Path $prismaPath) {
    try {
        Remove-Item -Path $prismaPath -Recurse -Force -ErrorAction Stop
        Write-Host "  ✓ Removed Prisma cache" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠ Could not remove: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  Continuing anyway..." -ForegroundColor Gray
    }
} else {
    Write-Host "  ✓ No cache to clean" -ForegroundColor Green
}

# Step 4: Generate Prisma Client
Write-Host ""
Write-Host "Step 3: Generating Prisma Client..." -ForegroundColor Yellow
try {
    npm run db:generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ SUCCESS! Prisma Client generated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Run: npm run db:push" -ForegroundColor White
        Write-Host "  2. Run: npm run db:seed" -ForegroundColor White
        Write-Host "  3. Run: npm run dev" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✗ FAILED to generate Prisma Client" -ForegroundColor Red
        Write-Host ""
        Write-Host "Try these solutions:" -ForegroundColor Yellow
        Write-Host "  1. Restart your computer (releases all file locks)" -ForegroundColor White
        Write-Host "  2. Close Cursor/VS Code completely and try again" -ForegroundColor White
        Write-Host "  3. Run PowerShell as Administrator" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
