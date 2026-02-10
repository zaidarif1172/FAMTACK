# FamTalk Submission Automation Script

Write-Host "Starting Automation for FamTalk Submission..."

# 1. Git Commit All Changes (if git is available)
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "Committing all changes..."
    git add .
    git commit -m "Final polish"
}
else {
    Write-Host "Git not found, skipping commit step."
}

# 2. Setup Server
Write-Host "Setting up Backend (Server)..."
Set-Location "server"
npm install
Write-Host "Syncing Database..."
npx prisma db push
Set-Location ..

# 3. Setup Client
Write-Host "Setting up Frontend (Client)..."
Set-Location "client"
npm install
Set-Location ..

Write-Host "ALL SET! Project is ready for submission."
Write-Host "To start the app, double-click run_app.bat on your Desktop or run it from here."
