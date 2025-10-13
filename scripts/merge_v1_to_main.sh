#!/usr/bin/env bash
set -euo pipefail

V1_BRANCH=${1:-v1}
MAIN_BRANCH=${2:-main}

echo "Fetching all branches..."
git fetch --all --prune

echo "Checking out ${MAIN_BRANCH}..."
git checkout "${MAIN_BRANCH}"
git pull origin "${MAIN_BRANCH}"

echo "Merging ${V1_BRANCH} into ${MAIN_BRANCH}..."
git merge --no-ff "${V1_BRANCH}" -m "Merge ${V1_BRANCH} into ${MAIN_BRANCH} (V1 consolidation)"

echo "Pushing ${MAIN_BRANCH} to origin..."
git push origin "${MAIN_BRANCH}"

echo "Tagging V1 launch..."
git tag -a v1-launch -m "V1 launch"
git push origin v1-launch

echo "Optionally deprecate old branches (uncomment to enable):"
# git branch -m legacy-main legacy-$(date +%F)
# git push origin :legacy-main
# git branch -d "${V1_BRANCH}"
# git push origin ":${V1_BRANCH}"

echo "Done. Push to main will trigger CI to deploy Firebase."

