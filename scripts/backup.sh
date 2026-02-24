#!/bin/bash

# Backup script for PostgreSQL database
# Usage: ./backup.sh [backup_dir]

set -e

# Configuration
BACKUP_DIR=${1:-./backups}
DB_NAME=${POSTGRES_DB:-p2pspb}
DB_USER=${POSTGRES_USER:-p2pspb}
DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}
RETENTION_DAYS=${RETENTION_DAYS:-7}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting backup of $DB_NAME at $(date)"

# Create backup
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify backup
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"
else
    echo "Backup failed!"
    exit 1
fi

# Clean old backups
echo "Cleaning backups older than $RETENTION_DAYS days"
find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup process finished at $(date)"
