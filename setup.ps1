# Quick Start Script for Organization Contribution Manager
# Run this script in PowerShell to set up the project

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Organization Contribution Manager" -ForegroundColor Cyan
Write-Host "Quick Setup Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[X] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    pause
    exit
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[X] npm is not available!" -ForegroundColor Red
    exit
}

Write-Host "`n================================`n" -ForegroundColor Cyan

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes...`n" -ForegroundColor Gray

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[OK] Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n[X] Failed to install dependencies" -ForegroundColor Red
    pause
    exit
}

Write-Host "`n================================`n" -ForegroundColor Cyan

# Create .env.local if it doesn't exist
if (-Not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    
    # Generate a random secret
    $secret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    
    $envContent = @"
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/organization-contributions

# NextAuth Configuration
NEXTAUTH_SECRET=$secret
NEXTAUTH_URL=http://localhost:3000

# Admin Credentials (for first-time setup)
ADMIN_EMAIL=admin@organization.com
ADMIN_PASSWORD=ChangeThisPassword123
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "[OK] .env.local file created!" -ForegroundColor Green
    Write-Host "  Default admin email: admin@organization.com" -ForegroundColor Gray
    Write-Host "  Default admin password: ChangeThisPassword123" -ForegroundColor Gray
    Write-Host "  IMPORTANT: Change these in production!" -ForegroundColor Yellow
} else {
    Write-Host "[OK] .env.local file already exists" -ForegroundColor Green
}

Write-Host "`n================================`n" -ForegroundColor Cyan

# Ask if user wants to start the dev server
$response = Read-Host "Do you want to start the development server now? (y/n)"

if ($response -eq "y" -or $response -eq "Y" -or $response -eq "yes") {
    Write-Host "`nStarting development server..." -ForegroundColor Yellow
    Write-Host "The application will be available at http://localhost:3000" -ForegroundColor Cyan
    Write-Host "`nIMPORTANT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Make sure MongoDB is running" -ForegroundColor Gray
    Write-Host "2. Initialize admin user by visiting: http://localhost:3000/api/users (POST)" -ForegroundColor Gray
    Write-Host "   OR run this command in a new PowerShell window:" -ForegroundColor Gray
    Write-Host "   Invoke-RestMethod -Uri 'http://localhost:3000/api/users' -Method POST" -ForegroundColor Cyan
    Write-Host "3. Then login at http://localhost:3000`n" -ForegroundColor Gray
    
    Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
    
    npm run dev
} else {
    Write-Host "`nSetup complete! To start the development server later, run:" -ForegroundColor Green
    Write-Host "  npm run dev`n" -ForegroundColor Cyan
    
    Write-Host "Do not forget to:" -ForegroundColor Yellow
    Write-Host "1. Install and start MongoDB" -ForegroundColor Gray
    Write-Host "2. Initialize the admin user (see SETUP_GUIDE.md)" -ForegroundColor Gray
    Write-Host "`nFor detailed instructions, see SETUP_GUIDE.md`n" -ForegroundColor Cyan
}

pause
