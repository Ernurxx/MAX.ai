# Fix npm configuration and install Supabase CLI
Write-Host "Fixing npm configuration..." -ForegroundColor Yellow

# Disable offline mode
npm config set offline false

# Remove proxy settings if they exist
npm config delete proxy 2>$null
npm config delete https-proxy 2>$null

# Clean cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install Supabase CLI as dev dependency
Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
npm install supabase --save-dev

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Supabase CLI installed successfully!" -ForegroundColor Green
    Write-Host "`nYou can now use it with:" -ForegroundColor Cyan
    Write-Host "  npx supabase --help" -ForegroundColor White
    Write-Host "  npm run supabase:login" -ForegroundColor White
    Write-Host "  npm run supabase:link" -ForegroundColor White
} else {
    Write-Host "`n❌ Installation failed. Please check your internet connection and npm configuration." -ForegroundColor Red
}
