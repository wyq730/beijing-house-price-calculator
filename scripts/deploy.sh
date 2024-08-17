#!/bin/sh

set -e

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
AUTO_COMMIT_MESSAGE="Update dist (auto committed)"

check_local_repo_clean() {
  if [ -z "$(git status --porcelain)" ]; then
    echo "Checked that git areas are clean."
  else
    echo "\033[0;31mERROR: changes must be commited before deploying. Please commit your changes first before deploy.\033[0m"
    exit 1
  fi
}

update_dist() {
  cd ${SCRIPT_DIR}/../frontend/
  npm run build

  if [ -z "$(git status --porcelain)" ]; then
    echo "dist directory is not changed."
  else
    # Commit the current change.
    git add dist/
    git commit -m "${AUTO_COMMIT_MESSAGE}"
    echo "\033[0;32mUpdated and pushed the dist directory. Commit: $(git rev-parse --short HEAD) ($(git rev-parse HEAD))\033[0m"
  fi
  cd -
}

check_local_repo_clean
update_dist

cd ${SCRIPT_DIR}/..
git subtree push --prefix frontend/dist origin gh-pages
