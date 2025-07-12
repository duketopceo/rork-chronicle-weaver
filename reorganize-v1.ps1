# Chronicle Weaver V1 Reorganization Script
# This script reorganizes the app into a simplified structure for V1
# Focus: Core narrative gameplay only

Write-Host "🚀 Chronicle Weaver V1 Reorganization" -ForegroundColor Cyan
Write-Host "Simplifying file structure for core narrative gameplay..." -ForegroundColor Yellow

# Get the current directory
$rootPath = Get-Location
Write-Host "Working in: $rootPath" -ForegroundColor Green

# Create new simplified directory structure
Write-Host "`n📁 Creating simplified directory structure..." -ForegroundColor Cyan

$newStructure = @(
    "src/app",
    "src/components", 
    "src/store",
    "src/types",
    "src/services",
    "src/constants",
    "src/utils",
    "assets/images",
    "docs/essential"
)

foreach ($dir in $newStructure) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    }
}

# Files to keep for V1 (core narrative gameplay)
Write-Host "`n📋 Identifying V1 core files..." -ForegroundColor Cyan

$v1CoreFiles = @{
    # App screens (essential only)
    "src/app/_layout.tsx" = "Core layout and providers"
    "src/app/index.tsx" = "Home screen with game start"
    "src/app/game/setup.tsx" = "Character and world setup"
    "src/app/game/play.tsx" = "Main narrative gameplay"
    
    # Essential components
    "src/components/Button.tsx" = "Core button component"
    "src/components/ChoiceButton.tsx" = "Narrative choice selection"
    "src/components/NarrativeText.tsx" = "Story text display"
    "src/components/TextInput.tsx" = "Basic text input"
    "src/components/ErrorBoundary.tsx" = "Error handling"
    
    # Core state and types
    "src/store/gameStore.ts" = "Central game state"
    "src/types/game.ts" = "Game type definitions"
    
    # Essential services
    "src/services/aiService.ts" = "Narrative generation"
    "src/services/firebaseUtils.ts" = "Basic Firebase utilities"
    
    # Constants and utilities
    "src/constants/colors.ts" = "App color scheme"
    "src/utils/debugSystem.ts" = "Basic debugging"
    
    # Configuration
    "package.json" = "Dependencies and scripts"
    "app.json" = "Expo configuration"
    "tsconfig.json" = "TypeScript configuration"
    ".env.example" = "Environment template"
    ".gitignore" = "Git ignore rules"
    
    # Essential docs
    "README.md" = "Project overview"
    "docs/security.md" = "Security guidelines"
}

# Files/directories to archive (move to archive folder)
Write-Host "`n📦 Creating archive for non-essential files..." -ForegroundColor Cyan

$archiveDir = "archive/v0-full-version"
if (!(Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
}

$filesToArchive = @(
    "src/app/game/character.tsx",
    "src/app/game/memories.tsx", 
    "src/app/game/lore.tsx",
    "src/app/game/systems.tsx",
    "src/app/game/chronos.tsx",
    "src/app/game/kronos.tsx",
    "src/components/AuthPanel.tsx",
    "src/components/BillingPanel.tsx",
    "src/components/CustomChoiceInput.tsx",
    "src/components/CustomSlider.tsx",
    "src/components/DebugPanel.tsx",
    "src/components/EnhancedDebugPanel.tsx",
    "src/components/MemoryList.tsx",
    "src/components/StatsBar.tsx",
    "src/components/SubscriptionGate.tsx",
    "src/components/SubscriptionPanel.tsx",
    "src/components/UltraDebugPanel.tsx",
    "src/components/UpgradePrompt.tsx",
    "src/components/UsageIndicator.tsx",
    "src/hooks",
    "src/styles",
    "src/utils/dateUtils.ts",
    "backend",
    "config",
    "scripts",
    "tests",
    "docs/APP_CONFIG_DOCS.md",
    "docs/CODE_DOCUMENTATION.md",
    "docs/CONTACT.md",
    "docs/DEPLOYMENT_CHECKLIST.md",
    "docs/FIREBASE_DEPLOYMENT_PLAN.md",
    "docs/FIREBASE_DOCS.md",
    "docs/PACKAGE_DOCS.md",
    "docs/PROJECT_CONTEXT.md",
    "docs/TSCONFIG_DOCS.md",
    "docs/WORK_HISTORY_DIARY.md",
    "docs/deployment",
    "docs/development"
)

Write-Host "Moving non-essential files to archive..." -ForegroundColor Yellow

foreach ($file in $filesToArchive) {
    if (Test-Path $file) {
        $destination = Join-Path $archiveDir (Split-Path $file -Leaf)
        try {
            Move-Item $file $destination -Force
            Write-Host "  📦 Archived: $file" -ForegroundColor Gray
        } catch {
            Write-Host "  ⚠️  Could not archive: $file" -ForegroundColor Yellow
        }
    }
}

# Clean up empty directories
Write-Host "`n🧹 Cleaning up empty directories..." -ForegroundColor Cyan

$emptyDirs = @("src/hooks", "src/styles", "backend", "config", "scripts", "tests", "docs/deployment", "docs/development")
foreach ($dir in $emptyDirs) {
    if (Test-Path $dir) {
        try {
            Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  🗑️  Removed empty: $dir" -ForegroundColor Gray
        } catch {
            # Ignore errors for non-empty directories
        }
    }
}

Write-Host "`n✅ V1 Reorganization Complete!" -ForegroundColor Green
Write-Host "`nV1 Structure Summary:" -ForegroundColor Cyan
Write-Host "📱 Core App: Home → Setup → Play narrative" -ForegroundColor White
Write-Host "🎮 Essential Features: Character creation, story choices, AI narrative" -ForegroundColor White  
Write-Host "🛠️  Development: Core components, state, and services only" -ForegroundColor White
Write-Host "📦 Archive: All advanced features saved in archive/ folder" -ForegroundColor White

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review remaining files in simplified structure" -ForegroundColor White
Write-Host "2. Remove unused dependencies from package.json" -ForegroundColor White
Write-Host "3. Simplify game state to essential narrative data" -ForegroundColor White
Write-Host "4. Test core narrative flow: Setup → Play → Choices" -ForegroundColor White

Write-Host "`n🚀 Ready for V1 development!" -ForegroundColor Green
