# Quick fix for Prisma EPERM error
# Run this script to unlock Prisma files

Write-Host "=== Prisma File Unlock Script ===" -ForegroundColor Cyan
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

# Step 3: Try to remove Prisma cache
Write-Host ""
Write-Host "Step 3: Removing Prisma cache..." -ForegroundColor Yellow
$prismaPath = "node_modules\.prisma"
if (Test-Path $prismaPath) {
    try {
        Remove-Item -Path $prismaPath -Recurse -Force -ErrorAction Stop
        Write-Host "  ✓ Prisma cache removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to remove: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Manual steps required:" -ForegroundColor Yellow
        Write-Host "  1. Close ALL terminals, VS Code, Cursor, and browsers" -ForegroundColor White
        Write-Host "  2. Open Task Manager (Ctrl+Shift+Esc)" -ForegroundColor White
        Write-Host "  3. End ALL 'Node.js' processes" -ForegroundColor White
        Write-Host "  4. Manually delete: $prismaPath" -ForegroundColor White
        Write-Host "  5. Run this script again" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "  ✓ Prisma cache doesn't exist (already clean)" -ForegroundColor Green
}

# Step 4: Generate Prisma Client
Write-Host ""
Write-Host "Step 4: Generating Prisma Client..." -ForegroundColor Yellow
try {
    npm run db:generate
    Write-Host ""
    Write-Host "✓ SUCCESS! Prisma Client generated." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
