# Chronicle Weaver Development Setup Script
# Run this script to install all required tools and dependencies

Write-Host "🎮 Chronicle Weaver Development Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script should be run as Administrator for best results" -ForegroundColor Yellow
    Write-Host "   Some installations may require elevated privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to install via winget
function Install-WithWinget($package, $displayName) {
    Write-Host "📦 Installing $displayName..." -ForegroundColor Yellow
    try {
        winget install $package --accept-package-agreements --accept-source-agreements
        Write-Host "✅ $displayName installed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to install $displayName" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
    }
}

# Function to install via npm
function Install-WithNpm($package, $displayName) {
    Write-Host "📦 Installing $displayName..." -ForegroundColor Yellow
    try {
        npm install -g $package
        Write-Host "✅ $displayName installed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to install $displayName" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
    }
}

Write-Host "🔍 Checking current tool installation status..." -ForegroundColor Blue
Write-Host ""

# Check Git
if (Test-Command "git") {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Git: Not installed" -ForegroundColor Red
    Install-WithWinget "Git.Git" "Git"
}

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js: Not installed" -ForegroundColor Red
    Install-WithWinget "OpenJS.NodeJS" "Node.js"
}

# Check npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm: Not available (should come with Node.js)" -ForegroundColor Red
}

# Check Bun
if (Test-Command "bun") {
    $bunVersion = bun --version
    Write-Host "✅ Bun: v$bunVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Bun: Not installed" -ForegroundColor Red
    Write-Host "📦 Installing Bun..." -ForegroundColor Yellow
    try {
        powershell -c "irm bun.sh/install.ps1 | iex"
        Write-Host "✅ Bun installed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to install Bun" -ForegroundColor Red
        Write-Host "   Please install manually from https://bun.sh" -ForegroundColor Red
    }
}

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""
Write-Host "🌐 Installing global packages..." -ForegroundColor Blue

# Install global npm packages
$globalPackages = @(
    @{package="firebase-tools"; name="Firebase CLI"},
    @{package="@expo/cli"; name="Expo CLI"},
    @{package="typescript"; name="TypeScript"},
    @{package="eslint"; name="ESLint"},
    @{package="prettier"; name="Prettier"}
)

foreach ($pkg in $globalPackages) {
    if (Test-Command $pkg.package) {
        Write-Host "✅ $($pkg.name): Already installed" -ForegroundColor Green
    } else {
        Install-WithNpm $pkg.package $pkg.name
    }
}

Write-Host ""
Write-Host "📂 Installing project dependencies..." -ForegroundColor Blue

# Navigate to project directory and install dependencies
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

if (Test-Path "package.json") {
    Write-Host "📦 Installing Chronicle Weaver dependencies..." -ForegroundColor Yellow
    
    # Try Bun first, fallback to npm
    if (Test-Command "bun") {
        bun install
    } elseif (Test-Command "npm") {
        npm install
    } else {
        Write-Host "❌ No package manager available!" -ForegroundColor Red
    }
    
    Write-Host "✅ Project dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found in current directory" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Verifying installation..." -ForegroundColor Blue

# Final verification
$tools = @("git", "node", "npm", "bun", "firebase", "expo")
$allInstalled = $true

foreach ($tool in $tools) {
    if (Test-Command $tool) {
        $version = & $tool --version 2>$null
        Write-Host "✅ $tool`: $version" -ForegroundColor Green
    } else {
        Write-Host "❌ $tool`: Not available" -ForegroundColor Red
        $allInstalled = $false
    }
}

Write-Host ""
if ($allInstalled) {
    Write-Host "🎉 All tools installed successfully!" -ForegroundColor Green
    Write-Host "🚀 You're ready to develop Chronicle Weaver!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run 'bun run start-web' to start development server" -ForegroundColor White
    Write-Host "2. Run 'firebase login' to authenticate with Firebase" -ForegroundColor White
    Write-Host "3. Run 'bun run build:production' to test production build" -ForegroundColor White
} else {
    Write-Host "⚠️  Some tools failed to install" -ForegroundColor Yellow
    Write-Host "   Please install missing tools manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Blue
Write-Host "   - Project Context: PROJECT_CONTEXT.md" -ForegroundColor White
Write-Host "   - Code Documentation: CODE_DOCUMENTATION.md" -ForegroundColor White
Write-Host "   - Package Info: PACKAGE_DOCS.md" -ForegroundColor White

pause
