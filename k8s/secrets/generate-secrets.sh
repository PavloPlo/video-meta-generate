#!/bin/bash

# Secrets Generation Script for CI/CD
# This script generates Kubernetes secrets from environment variables
# Usage: ./generate-secrets.sh <namespace> <environment>

set -e

NAMESPACE=${1:-staging}
ENVIRONMENT=${2:-staging}

echo "🔐 Generating secrets for $ENVIRONMENT environment in $NAMESPACE namespace"

# Create app-secrets
echo "📝 Creating app-secrets..."
kubectl create secret generic app-secrets \
  --namespace="$NAMESPACE" \
  --from-literal=DATABASE_URL="${DATABASE_URL}" \
  --from-literal=DIRECT_URL="${DIRECT_URL}" \
  --from-literal=SESSION_COOKIE_NAME="${SESSION_COOKIE_NAME:-video_meta_session}" \
  --from-literal=SESSION_TTL_DAYS="${SESSION_TTL_DAYS:-14}" \
  --from-literal=STORAGE_BUCKET="${STORAGE_BUCKET:-}" \
  --from-literal=STORAGE_ACCESS_KEY_ID="${STORAGE_ACCESS_KEY_ID:-}" \
  --from-literal=STORAGE_SECRET_ACCESS_KEY="${STORAGE_SECRET_ACCESS_KEY:-}" \
  --from-literal=STORAGE_REGION="${STORAGE_REGION:-us-east-1}" \
  --from-literal=STORAGE_FORCE_PATH_STYLE="${STORAGE_FORCE_PATH_STYLE:-false}" \
  --from-literal=OPENAI_API_KEY="${OPENAI_API_KEY:-}" \
  --dry-run=client -o yaml | kubectl apply -f -

# Create postgres-secrets (staging only)
if [ "$ENVIRONMENT" = "staging" ]; then
  echo "🗄️  Creating postgres-secrets..."
  kubectl create secret generic postgres-secrets \
    --namespace="$NAMESPACE" \
    --from-literal=POSTGRES_USER="${POSTGRES_USER:-postgres}" \
    --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
    --from-literal=POSTGRES_DB="${POSTGRES_DB:-video_meta_app}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

# Create minio-secrets (staging only)
if [ "$ENVIRONMENT" = "staging" ]; then
  echo "💾 Creating minio-secrets..."
  kubectl create secret generic minio-secrets \
    --namespace="$NAMESPACE" \
    --from-literal=MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}" \
    --from-literal=MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

# Create grafana basic auth (staging only)
if [ "$ENVIRONMENT" = "staging" ]; then
  echo "📊 Creating grafana basic auth..."
  # Generate htpasswd if not provided
  if [ -n "${GRAFANA_USERNAME:-}" ] && [ -n "${GRAFANA_PASSWORD:-}" ]; then
    GRAFANA_AUTH=$(htpasswd -nb "$GRAFANA_USERNAME" "$GRAFANA_PASSWORD" | base64 -w 0)
    kubectl create secret generic grafana-auth \
      --namespace=monitoring \
      --from-literal=auth="$GRAFANA_AUTH" \
      --dry-run=client -o yaml | kubectl apply -f -
  fi
fi

echo "✅ Secrets generated successfully!"
echo ""
echo "🔍 Verify secrets:"
echo "kubectl get secrets -n $NAMESPACE"
echo "kubectl get secrets -n monitoring"
