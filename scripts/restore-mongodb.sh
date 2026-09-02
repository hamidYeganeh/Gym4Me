#!/usr/bin/env bash
set -euo pipefail

if [[ "${CONFIRM_RESTORE:-}" != "RESTORE_GYM4ME" ]]; then
  echo "Set CONFIRM_RESTORE=RESTORE_GYM4ME to confirm this destructive operation" >&2
  exit 1
fi
if [[ -z "${MONGODB_URI:-}" || -z "${BACKUP_FILE:-}" ]]; then
  echo "MONGODB_URI and BACKUP_FILE are required" >&2
  exit 1
fi
if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file does not exist: $BACKUP_FILE" >&2
  exit 1
fi

if [[ -f "$BACKUP_FILE.sha256" ]]; then
  sha256sum --check "$BACKUP_FILE.sha256"
fi
mongorestore --uri="$MONGODB_URI" --archive="$BACKUP_FILE" --gzip --drop
