# Check Authentication and Database Setup
Write-Host ""
Write-Host "=== MAX.AI Database & Auth Check ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check if PostgreSQL is running
Write-Host "1. PostgreSQL Service Status:" -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "   OK PostgreSQL service is $($pgService.Status)" -ForegroundColor Green
} else {
    Write-Host "   X PostgreSQL service not found" -ForegroundColor Red
}

# 2. Check environment variables
Write-Host ""
Write-Host "2. Environment Variables:" -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "DATABASE_URL") {
        Write-Host "   OK DATABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "   X DATABASE_URL not found in .env" -ForegroundColor Red
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "   OK SUPABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "   WARN SUPABASE_URL not configured" -ForegroundColor Yellow
    }
    
    if ($envContent -match "OPENAI_API_KEY") {
        Write-Host "   OK OPENAI_API_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "   X OPENAI_API_KEY not found" -ForegroundColor Red
    }
} else {
    Write-Host "   X .env file not found!" -ForegroundColor Red
}

# 3. Check Prisma setup
Write-Host ""
Write-Host "3. Prisma Setup:" -ForegroundColor Yellow
if (Test-Path "prisma/schema.prisma") {
    Write-Host "   OK Prisma schema exists" -ForegroundColor Green
} else {
    Write-Host "   X Prisma schema not found" -ForegroundColor Red
}

if (Test-Path "node_modules/.prisma/client") {
    Write-Host "   OK Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "   WARN Prisma Client NOT generated" -ForegroundColor Yellow
}

# 4. Check authentication files
Write-Host ""
Write-Host "4. Authentication Files:" -ForegroundColor Yellow
$authFiles = @(
    "app/(auth)/login/page.tsx",
    "app/(auth)/signup/page.tsx",
    "lib/auth.ts",
    "lib/supabase.ts",
    "app/api/auth/supabase/signup/route.ts",
    "app/api/auth/supabase/signin/route.ts"
)

foreach ($file in $authFiles) {
    if (Test-Path $file) {
        Write-Host "   OK $file" -ForegroundColor Green
    } else {
        Write-Host "   X $file (missing)" -ForegroundColor Red
    }
}

# 5. Recommendations
Write-Host ""
Write-Host "=== Recommendations ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "To set up the database properly:" -ForegroundColor White
Write-Host "  1. npm run db:generate" -ForegroundColor Gray
Write-Host "     (Creates Prisma Client)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. npm run db:push -- --accept-data-loss" -ForegroundColor Gray
Write-Host "     (Creates database tables)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  3. npm run db:seed" -ForegroundColor Gray
Write-Host "     (Adds sample data)" -ForegroundColor DarkGray

Write-Host ""
Write-Host "Authentication Methods:" -ForegroundColor White
Write-Host "  Signup: http://localhost:3001/signup" -ForegroundColor Gray
Write-Host "  Login:  http://localhost:3001/login" -ForegroundColor Gray

Write-Host ""
