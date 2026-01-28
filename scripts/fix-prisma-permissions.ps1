# Fix Prisma Permission Issues on Windows
# Run this script as Administrator if needed

Write-Host "Stopping any running Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Removing Prisma client cache..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Regenerating Prisma Client..." -ForegroundColor Green
npm run db:generate

Write-Host "Done!" -ForegroundColor Green
