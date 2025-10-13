Param(
  [string]$V1Branch = "v1",
  [string]$MainBranch = "main"
)

Write-Host "Fetching all branches..." -ForegroundColor Cyan
git fetch --all --prune

Write-Host "Checking out $MainBranch..." -ForegroundColor Cyan
git checkout $MainBranch
git pull origin $MainBranch

Write-Host "Merging $V1Branch into $MainBranch..." -ForegroundColor Cyan
git merge --no-ff $V1Branch -m "Merge $V1Branch into $MainBranch (V1 consolidation)"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Merge failed. Resolve conflicts and re-run this script."
  exit 1
}

Write-Host "Pushing $MainBranch to origin..." -ForegroundColor Cyan
git push origin $MainBranch

Write-Host "Tagging V1 launch..." -ForegroundColor Cyan
git tag -a v1-launch -m "V1 launch"
git push origin v1-launch

Write-Host "Optionally deprecate old branches (uncomment to enable):" -ForegroundColor Yellow
# git branch -m legacy-main legacy-$(Get-Date -Format 'yyyy-MM-dd')
# git push origin :legacy-main
# git branch -d $V1Branch
# git push origin :$V1Branch

Write-Host "Done. Set CI secrets and push to main to deploy." -ForegroundColor Green

