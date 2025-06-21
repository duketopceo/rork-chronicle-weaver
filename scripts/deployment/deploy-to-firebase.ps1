# Chronicle Weaver - Firebase Deployment Quick Start
# Author: Rork <duketopceo@gmail.com>
# Date: June 18, 2025

Write-Host "🚀 Chronicle Weaver Firebase Deployment Quick Start" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Configuration
$ProjectPath = "c:\Users\kimba\Documents\Current rork app\rork-chronicle-weaver"
$LogFile = "$ProjectPath\deployment.log"

# Function to log messages
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARNING") { "Yellow" } else { "Green" })
    Add-Content -Path $LogFile -Value $LogEntry
}

# Start deployment log
Write-Log "Starting Chronicle Weaver Firebase Deployment Process"

try {
    # Step 1: Navigate to project directory
    Write-Host "`n📁 Step 1: Navigating to project directory..." -ForegroundColor Yellow
    Set-Location $ProjectPath
    Write-Log "Changed directory to: $ProjectPath"

    # Step 2: Check prerequisites
    Write-Host "`n🔍 Step 2: Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Log "Node.js version: $nodeVersion"
    } catch {
        Write-Log "❌ Node.js not found. Please install Node.js from https://nodejs.org/" "ERROR"
        exit 1
    }

    # Check Bun
    try {
        $bunVersion = bun --version
        Write-Log "Bun version: $bunVersion"
    } catch {
        Write-Log "❌ Bun not found. Please install Bun from https://bun.sh/" "ERROR"
        exit 1
    }

    # Check Firebase CLI
    try {
        $firebaseVersion = firebase --version
        Write-Log "Firebase CLI version: $firebaseVersion"
    } catch {
        Write-Log "❌ Firebase CLI not found. Installing..." "WARNING"
        Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
        npm install -g firebase-tools
        Write-Log "Firebase CLI installed successfully"
    }

    # Check Git
    try {
        $gitVersion = git --version
        Write-Log "Git version: $gitVersion"
    } catch {
        Write-Log "❌ Git not found. Please install Git from https://git-scm.com/" "ERROR"
        exit 1
    }

    # Step 3: Install dependencies
    Write-Host "`n📦 Step 3: Installing project dependencies..." -ForegroundColor Yellow
    Write-Log "Installing dependencies with Bun..."
    bun install
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Dependencies installed successfully"
    } else {
        Write-Log "❌ Failed to install dependencies" "ERROR"
        exit 1
    }

    # Step 4: Environment setup check
    Write-Host "`n🔧 Step 4: Checking environment configuration..." -ForegroundColor Yellow
    if (Test-Path ".env.local") {
        Write-Log "✅ .env.local found"
    } else {
        Write-Log "⚠️ .env.local not found. Creating from template..." "WARNING"
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env.local"
            Write-Log "✅ Created .env.local from .env.example"
            Write-Host "⚠️  Please edit .env.local with your Firebase configuration!" -ForegroundColor Red
            Write-Host "Press any key to continue after editing .env.local..." -ForegroundColor Yellow
            Read-Host
        } else {
            Write-Log "❌ .env.example not found. Please create environment configuration manually." "ERROR"
        }
    }

    # Step 5: Firebase authentication
    Write-Host "`n🔐 Step 5: Firebase authentication..." -ForegroundColor Yellow
    Write-Log "Checking Firebase authentication..."
    
    try {
        $firebaseProjects = firebase projects:list 2>&1
        if ($firebaseProjects -match "Error") {
            Write-Log "Not authenticated with Firebase. Starting login process..." "WARNING"
            Write-Host "🔐 Opening browser for Firebase authentication..." -ForegroundColor Yellow
            firebase login
            Write-Log "Firebase authentication completed"
        } else {
            Write-Log "✅ Already authenticated with Firebase"
        }
    } catch {
        Write-Log "❌ Firebase authentication failed" "ERROR"
        exit 1
    }

    # Step 6: Build project
    Write-Host "`n🏗️ Step 6: Building project for production..." -ForegroundColor Yellow
    Write-Log "Starting production build..."
    
    # Clean previous builds
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Log "Cleaned previous build directory"
    }

    # Build with Bun
    bun run build:production
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Production build completed successfully"
    } else {
        Write-Log "❌ Production build failed" "ERROR"
        exit 1
    }

    # Verify build output
    if (Test-Path "dist") {
        $distFiles = Get-ChildItem -Path "dist" -Recurse | Measure-Object
        Write-Log "Build output: $($distFiles.Count) files in dist directory"
    } else {
        Write-Log "❌ Build output directory not found" "ERROR"
        exit 1
    }

    # Step 7: Test local serving
    Write-Host "`n🧪 Step 7: Testing local Firebase serving..." -ForegroundColor Yellow
    Write-Log "Starting local Firebase serve test..."
    
    Write-Host "Starting local server for testing..." -ForegroundColor Cyan
    Write-Host "This will open Firebase Hosting at http://localhost:5000" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server when you're done testing." -ForegroundColor Yellow
    Write-Host "Press any key to start the local server..." -ForegroundColor Green
    Read-Host

    firebase serve --only hosting

    # Step 8: Deploy to Firebase
    Write-Host "`n🚀 Step 8: Deploying to Firebase Hosting..." -ForegroundColor Yellow
    Write-Host "Ready to deploy to Firebase Hosting!" -ForegroundColor Green
    Write-Host "This will make your app live on the internet." -ForegroundColor Yellow
    
    $deploy = Read-Host "Do you want to deploy now? (y/N)"
    if ($deploy.ToLower() -eq "y" -or $deploy.ToLower() -eq "yes") {
        Write-Log "Starting Firebase deployment..."
        firebase deploy --only hosting
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Firebase deployment completed successfully!"
            Write-Host "`n🎉 Deployment Successful!" -ForegroundColor Green
            Write-Host "Your app is now live!" -ForegroundColor Green
            
            # Get the hosting URL
            try {
                $hostingUrl = firebase hosting:sites:list 2>&1 | Select-String "https://"
                if ($hostingUrl) {
                    Write-Host "🌐 Your app URL: $hostingUrl" -ForegroundColor Cyan
                }
            } catch {
                Write-Log "Could not retrieve hosting URL automatically" "WARNING"
            }
        } else {
            Write-Log "❌ Firebase deployment failed" "ERROR"
            exit 1
        }
    } else {
        Write-Log "Deployment skipped by user"
        Write-Host "Deployment skipped. You can deploy later using: firebase deploy --only hosting" -ForegroundColor Yellow
    }

    # Step 9: Custom domain setup instructions
    Write-Host "`n🌐 Step 9: Custom Domain Setup (chronicleweaver.com)" -ForegroundColor Yellow
    Write-Host "To set up your custom domain:" -ForegroundColor Cyan
    Write-Host "1. Go to Firebase Console: https://console.firebase.google.com" -ForegroundColor White
    Write-Host "2. Navigate to Hosting section" -ForegroundColor White
    Write-Host "3. Click 'Add custom domain'" -ForegroundColor White
    Write-Host "4. Enter: chronicleweaver.com" -ForegroundColor White
    Write-Host "5. Follow the DNS configuration instructions" -ForegroundColor White
    Write-Host "6. Add the provided DNS records to your domain registrar" -ForegroundColor White
    
    Write-Log "Deployment process completed successfully!"
    
} catch {
    Write-Log "❌ Deployment process failed: $($_.Exception.Message)" "ERROR"
    Write-Host "❌ Deployment failed. Check the log file: $LogFile" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deployment process completed!" -ForegroundColor Green
Write-Host "📋 Check the deployment log: $LogFile" -ForegroundColor Cyan
Write-Host "📖 For detailed instructions, see: FIREBASE_DEPLOYMENT_PLAN.md" -ForegroundColor Cyan
Write-Host "📧 Support: duketopceo@gmail.com" -ForegroundColor Cyan
