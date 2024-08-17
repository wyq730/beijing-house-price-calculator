#!/bin/sh

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

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

  cd -
}

check_local_repo_clean
update_dist
