#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI is required" >&2
  exit 1
fi

backup_dir="${BACKUP_DIR:-./var/backups}"
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
destination="$backup_dir/gym4me-$timestamp.archive.gz"
mongodump --uri="$MONGODB_URI" --archive="$destination" --gzip
sha256sum "$destination" > "$destination.sha256"
echo "$destination"
