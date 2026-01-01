#!/bin/bash
set -e

APP_DIR="/srv/apps/video-meta-generate"
LOG_DIR="/var/log/video-meta-generate"
USER=$(whoami)

echo "Verifying deployment setup for user: ${USER}..."

# Check if directories exist and are owned by current user
if [ ! -d "${APP_DIR}" ]; then
  echo "❌ ERROR: ${APP_DIR} does not exist"
  exit 1
fi

if [ ! -d "${LOG_DIR}" ]; then
  echo "❌ ERROR: ${LOG_DIR} does not exist"
  exit 1
fi

# Check ownership (should be owned by current user)
if ! sudo stat -c '%U' "${APP_DIR}" | grep -q "^${USER}$"; then
  echo "⚠️  WARNING: ${APP_DIR} not owned by ${USER}"
fi

if ! sudo stat -c '%U' "${LOG_DIR}" | grep -q "^${USER}$"; then
  echo "⚠️  WARNING: ${LOG_DIR} not owned by ${USER}"
fi

# Check if PM2 is available
if ! command -v pm2 &> /dev/null; then
  echo "⚠️  WARNING: PM2 not found in PATH"
else
  echo "✅ PM2 is available"
fi

echo "Setup verification complete!"
echo "Deployment directory: ${APP_DIR}"
echo "Log directory: ${LOG_DIR}"
echo ""
echo "Note: PM2 and systemd setup should be done separately as root/deploy user"

