@echo off
echo 🚀 GetCash GitHub Push Helper
echo =============================
echo.
echo This script will help you push your GetCash app to GitHub.
echo.
echo IMPORTANT: Before running this script, you need to:
echo 1. Create a repository at https://github.com/MakeMoney256/makeMny
echo 2. Create a Personal Access Token at https://github.com/settings/tokens
echo.
echo Press any key when you're ready...
pause >nul

echo.
echo Setting up git user...
git config --global user.name "MakeMoney256"
git config --global user.email "your-email@example.com"

echo.
echo 🔐 When prompted for credentials:
echo Username: MakeMoney256
echo Password: [paste your Personal Access Token]
echo.
echo Press Enter to continue...
pause >nul

echo.
echo 🚀 Pushing to GitHub...
git push -u origin master

echo.
echo ✅ Success! Your code has been pushed to GitHub.
echo 🌐 Visit: https://github.com/MakeMoney256/makeMny
echo.
pause