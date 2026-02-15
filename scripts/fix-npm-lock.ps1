# Fix corrupted npm lock file
Write-Host "Fixing corrupted npm lock file..." -ForegroundColor Yellow

# Backup the current lock file
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "package-lock.json.backup"
    Write-Host "Backed up package-lock.json" -ForegroundColor Cyan
}

# Remove corrupted lock file
Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
Write-Host "Removed corrupted package-lock.json" -ForegroundColor Cyan

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Reinstall to regenerate lock file
Write-Host "Regenerating package-lock.json..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ npm lock file fixed successfully!" -ForegroundColor Green
    Write-Host "You can now run npm commands normally." -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Failed to regenerate lock file. Check your internet connection." -ForegroundColor Red
}
