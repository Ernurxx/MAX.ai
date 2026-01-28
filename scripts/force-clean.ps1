# Force clean everything - Use with caution!
# Run as Administrator

Write-Host "Force cleaning project..." -ForegroundColor Yellow

# Stop all Node processes
Write-Host "Stopping all Node processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node.exe" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to release files
Start-Sleep -Seconds 3

# Remove folders
Write-Host "Removing folders..." -ForegroundColor Cyan

$folders = @(
    "node_modules",
    ".next",
    "node_modules\.prisma",
    "node_modules\.cache"
)

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "Removing: $folder" -ForegroundColor Yellow
        try {
            Remove-Item -Path $folder -Recurse -Force -ErrorAction Stop
            Write-Host "  ✓ Removed" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nCleanup complete!" -ForegroundColor Green
Write-Host "Run 'npm install' to reinstall dependencies" -ForegroundColor Cyan
