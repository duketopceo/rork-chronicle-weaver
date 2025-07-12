# Chronicle Weaver - One-Click Firebase Deployment
# Quick deployment script for Chronicle Weaver
# Author: Chronicle Weaver Team

Write-Host "🚀 Chronicle Weaver - Quick Firebase Deploy" -ForegroundColor Cyan

# Quick deployment commands
Write-Host "Installing dependencies..." -ForegroundColor Yellow
bun install

Write-Host "Building for production..." -ForegroundColor Yellow  
bun run build:production

Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app should now be live on Firebase Hosting!" -ForegroundColor Cyan
