# Chronicle Weaver V1 Simple Reorganization
Write-Host "🚀 Chronicle Weaver V1 Reorganization" -ForegroundColor Cyan

# Create archive directory
$archiveDir = "archive"
if (!(Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force
    Write-Host "Created archive directory" -ForegroundColor Green
}

# Archive non-essential files
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
    "src/components/UsageIndicator.tsx"
)

Write-Host "Archiving non-essential files..." -ForegroundColor Yellow

foreach ($file in $filesToArchive) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        $destination = Join-Path $archiveDir $fileName
        Move-Item $file $destination -Force
        Write-Host "Archived: $file" -ForegroundColor Gray
    }
}

Write-Host "✅ Basic reorganization complete!" -ForegroundColor Green
Write-Host "Essential files remain, extras moved to archive/" -ForegroundColor Cyan
