# GetCash GitHub Push Script
Write-Host "🚀 GetCash GitHub Push Helper" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you push your GetCash app to GitHub." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Before running this script, you need to:" -ForegroundColor Red
Write-Host "1. Create a repository at https://github.com/MakeMoney256/makeMny" -ForegroundColor White
Write-Host "2. Create a Personal Access Token at https://github.com/settings/tokens" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when you're ready to continue"

Write-Host ""
Write-Host "Setting up git user..." -ForegroundColor Yellow
git config --global user.name "MakeMoney256"
git config --global user.email "your-email@example.com"

Write-Host ""
Write-Host "🔐 When prompted for credentials:" -ForegroundColor Green
Write-Host "Username: MakeMoney256" -ForegroundColor White
Write-Host "Password: [paste your Personal Access Token]" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to start pushing"

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Success! Your code has been pushed to GitHub." -ForegroundColor Green
    Write-Host "🌐 Visit: https://github.com/MakeMoney256/makeMny" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check your credentials and try again." -ForegroundColor Red
}

Read-Host "Press Enter to exit"