# Secrets Management

This directory contains documentation and examples for managing secrets in the Video Meta Generate application.

## Secrets Management Strategy

We use **GitHub Actions with Kubernetes Secrets** for secrets management:

- Secrets are created dynamically during CI/CD deployment
- No secrets are stored in the Git repository
- Environment-specific secrets are injected via GitHub repository secrets
- Secrets are encrypted at rest in Kubernetes

## Required Secrets

### Application Secrets (`app-secrets`)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  # Database Configuration
  DATABASE_URL: "postgresql://user:password@host:5432/database"
  DIRECT_URL: "postgresql://user:password@host:5432/database"

  # Session Management
  SESSION_COOKIE_NAME: "sid"
  SESSION_TTL_DAYS: "14"

  # Storage Configuration (cloud storage)
  STORAGE_BUCKET: "your-bucket-name"
  STORAGE_ACCESS_KEY_ID: "your-access-key"
  STORAGE_SECRET_ACCESS_KEY: "your-secret-key"
  STORAGE_REGION: "us-east-1"

  # AI Provider Configuration
  OPENAI_API_KEY: "sk-..."
type: Opaque
```

### PostgreSQL Secrets (`postgres-secrets`) - Staging Only

For in-cluster PostgreSQL (staging):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secrets
type: Opaque
stringData:
  POSTGRES_USER: "postgres"
  POSTGRES_PASSWORD: "your-secure-password"
  POSTGRES_DB: "video_meta_app"
```

### MinIO Secrets (`minio-secrets`) - Staging Only

For in-cluster MinIO (staging):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: minio-secrets
type: Opaque
stringData:
  MINIO_ROOT_USER: "minioadmin"
  MINIO_ROOT_PASSWORD: "your-secure-password"
```

## GitHub Actions Secret Creation

### Staging Deployment Secrets

In your GitHub repository, create these secrets under **Settings > Secrets and variables > Actions**:

```
STAGING_DATABASE_URL
STAGING_DIRECT_URL
STAGING_KUBECONFIG
SESSION_COOKIE_NAME
SESSION_TTL_DAYS
# For in-cluster PostgreSQL
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
# For in-cluster MinIO
MINIO_ROOT_USER
MINIO_ROOT_PASSWORD
```

### Production Deployment Secrets

```
PROD_DATABASE_URL
PROD_DIRECT_URL
PROD_KUBECONFIG
SESSION_COOKIE_NAME
SESSION_TTL_DAYS
# Cloud storage credentials
STORAGE_BUCKET
STORAGE_ACCESS_KEY_ID
STORAGE_SECRET_ACCESS_KEY
STORAGE_REGION
# AI provider
OPENAI_API_KEY
```

## CI/CD Secret Injection

The GitHub Actions workflow creates secrets dynamically:

```yaml
# Example from .github/workflows/deploy-staging.yml
- name: Deploy with Kustomize
  run: |
    kubectl create secret generic app-secrets \
      --from-literal=DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }} \
      --from-literal=DIRECT_URL=${{ secrets.STAGING_DIRECT_URL }} \
      --from-literal=SESSION_COOKIE_NAME=${{ secrets.SESSION_COOKIE_NAME }} \
      --dry-run=client -o yaml | kubectl apply -f -

    kubectl create secret generic postgres-secrets \
      --from-literal=POSTGRES_USER=${{ secrets.POSTGRES_USER }} \
      --from-literal=POSTGRES_PASSWORD=${{ secrets.POSTGRES_PASSWORD }} \
      --from-literal=POSTGRES_DB=${{ secrets.POSTGRES_DB }} \
      --dry-run=client -o yaml | kubectl apply -f -
```

## Security Best Practices

### 1. Principle of Least Privilege
- Use read-only credentials where possible
- Limit database permissions to required operations
- Use separate credentials for different environments

### 2. Secret Rotation
- Rotate secrets regularly (90-180 days)
- Use different credentials for staging/production
- Automate rotation where possible

### 3. Access Control
- Limit GitHub repository access
- Use branch protection rules
- Require code reviews for workflow changes

### 4. Monitoring
- Monitor secret access patterns
- Set up alerts for unusual activity
- Regularly audit secret usage

## Alternative Secrets Management

### For Enhanced Security (Future)

Consider these alternatives for enhanced secrets management:

#### 1. External Secrets Operator
- Integrates with cloud secret managers (AWS Secrets Manager, GCP Secret Manager)
- Secrets stored externally, injected into Kubernetes
- Better audit trails and access control

#### 2. Sealed Secrets
- Encrypts secrets in Git using asymmetric encryption
- Secrets are sealed in the repository
- Unsealed at deployment time by the Sealed Secrets controller

#### 3. SOPS
- Mozilla's tool for encrypting YAML/JSON files
- Works with any KMS (AWS KMS, GCP KMS, age, etc.)
- Integrates well with GitOps workflows

## Local Development

For local development with Docker Compose, secrets are managed differently:

```yaml
# docker-compose.yml
services:
  app:
    environment:
      DATABASE_URL: ${DATABASE_URL}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    env_file:
      - .env.local
```

Create `.env.local` with your local secrets (never commit this file).

## Troubleshooting

### Secret Not Found Errors
```bash
# Check if secret exists
kubectl get secret app-secrets -n staging

# Check secret contents (be careful!)
kubectl get secret app-secrets -n staging -o yaml

# Check pod environment variables
kubectl exec -n staging deployment/video-meta-app -- env | grep -E "(DATABASE|SESSION|STORAGE)"
```

### GitHub Actions Secrets
```bash
# Verify secrets are set in GitHub
# Go to: Settings > Secrets and variables > Actions
# Check that all required secrets are present
```

### Permission Issues
```bash
# Check service account permissions
kubectl auth can-i create secrets --as=system:serviceaccount:staging:default

# Check GitHub Actions permissions
# In workflow file, ensure proper permissions:
permissions:
  contents: read
  packages: write
```

## Migration Guide

### From Local to Kubernetes
1. Move secrets from `.env` files to GitHub repository secrets
2. Update CI/CD to inject secrets during deployment
3. Test secret injection in staging first
4. Update application code to read from environment variables

### Environment-Specific Secrets
- Use different secret names per environment (`app-secrets-staging`, `app-secrets-prod`)
- Or use the same secret name with different values injected by CI/CD
- Recommended: Same secret name, different values per environment
