# Reset Database - Delete all data and reseed

Write-Host "`n=== Resetting Database ===" -ForegroundColor Cyan

# Push schema (creates tables if needed)
Write-Host "`n1. Pushing schema..." -ForegroundColor Yellow
npm run db:push -- --force-reset --accept-data-loss

# Seed database
Write-Host "`n2. Seeding database..." -ForegroundColor Yellow
npm run db:seed

Write-Host "`n=== Database Reset Complete ===" -ForegroundColor Green
Write-Host "Fresh data has been loaded!" -ForegroundColor Green
