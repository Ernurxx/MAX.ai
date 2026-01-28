# Fix npm offline mode issue
# This script helps resolve the "offline = true" environment variable problem

Write-Host "=== Fixing npm Offline Mode ===" -ForegroundColor Cyan
Write-Host ""

# Check current offline setting
Write-Host "Current npm offline setting:" -ForegroundColor Yellow
$currentOffline = $env:npm_config_offline
if ($currentOffline) {
    Write-Host "  npm_config_offline = $currentOffline" -ForegroundColor Red
} else {
    Write-Host "  npm_config_offline = (not set)" -ForegroundColor Green
}

Write-Host ""

# Step 1: Unset for current session
Write-Host "Step 1: Unsetting offline mode for current PowerShell session..." -ForegroundColor Yellow
$env:npm_config_offline = $null
Write-Host "  ✓ Offline mode unset for this session" -ForegroundColor Green

# Step 2: Check proxy settings
Write-Host ""
Write-Host "Step 2: Checking proxy settings..." -ForegroundColor Yellow
$proxy = npm config get proxy 2>&1
$httpsProxy = npm config get https-proxy 2>&1

if ($proxy -and $proxy -ne "null") {
    Write-Host "  Found proxy: $proxy" -ForegroundColor Yellow
    Write-Host "  You may need to configure proxy settings" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ No proxy configured" -ForegroundColor Green
}

# Step 3: Test npm connectivity
Write-Host ""
Write-Host "Step 3: Testing npm registry connectivity..." -ForegroundColor Yellow
try {
    $test = npm ping 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Successfully connected to npm registry" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to connect to npm registry" -ForegroundColor Red
        Write-Host "    Error: $test" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ✗ Error testing connectivity: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. If offline mode was set, you need to remove it permanently:" -ForegroundColor White
Write-Host "   - Open System Properties → Environment Variables" -ForegroundColor Gray
Write-Host "   - Find 'npm_config_offline' in User or System variables" -ForegroundColor Gray
Write-Host "   - Delete it" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart your terminal/IDE after removing the environment variable" -ForegroundColor White
Write-Host ""
Write-Host "3. Try installing Prisma packages:" -ForegroundColor White
Write-Host "   npm install @prisma/client@5.7.0 prisma@5.7.0 --save-exact" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Generate Prisma Client:" -ForegroundColor White
Write-Host "   npm run db:generate" -ForegroundColor Gray
Write-Host ""
