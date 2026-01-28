# Unlock and remove Prisma files on Windows
# Run this script as Administrator for best results

Write-Host "Checking for processes using Prisma files..." -ForegroundColor Yellow

# Find processes that might be locking the file
$lockedFile = "node_modules\.prisma\client\query_engine-windows.dll.node"

# Stop all Node processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping process: $($_.Id) - $($_.Path)" -ForegroundColor Cyan
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Wait a moment for processes to release files
Start-Sleep -Seconds 2

# Try to remove the Prisma folder
Write-Host "Attempting to remove Prisma cache..." -ForegroundColor Yellow
try {
    Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction Stop
    Write-Host "Successfully removed Prisma cache!" -ForegroundColor Green
} catch {
    Write-Host "Failed to remove Prisma cache. Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try the following:" -ForegroundColor Yellow
    Write-Host "1. Close all terminals, VS Code, Cursor, and other editors" -ForegroundColor White
    Write-Host "2. Run PowerShell as Administrator" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host "4. Or manually delete: $lockedFile" -ForegroundColor White
}

Write-Host "Done!" -ForegroundColor Green
