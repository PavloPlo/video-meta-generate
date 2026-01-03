# MinIO Storage Configuration

This directory contains Kubernetes manifests for MinIO object storage deployment with support for different storage strategies.

## Deployment Options

### Option A: In-Cluster MinIO (Staging)
- **Use Case**: Development, staging, cost-sensitive environments
- **Pros**: Self-contained, no external dependencies, S3-compatible API
- **Cons**: Requires cluster resources, backup management, single point of failure
- **Configuration**: Uses StatefulSet with persistent storage

### Option B: Cloud Storage (Production)
- **Use Case**: Production environments
- **Pros**: Managed by cloud provider, high availability, global distribution
- **Cons**: Additional cost, vendor lock-in
- **Configuration**: No Kubernetes deployment, uses cloud storage APIs

## Usage

### Staging (In-Cluster MinIO)
```bash
kubectl apply -k overlays/staging/minio/
```

### Production (Cloud Storage)
Production uses cloud storage - no MinIO deployment needed in Kubernetes.

## Environment Variables

The application expects these storage environment variables:

```yaml
# For MinIO (in-cluster)
STORAGE_ENDPOINT: "http://minio.staging.svc.cluster.local:9000"
STORAGE_BUCKET: "video-meta-app"
STORAGE_ACCESS_KEY_ID: "minioadmin"  # From minio-secrets
STORAGE_SECRET_ACCESS_KEY: "your-password"  # From minio-secrets

# For Cloud Storage (AWS S3, GCP GCS, etc.)
STORAGE_ENDPOINT: ""  # Use default cloud endpoints
STORAGE_BUCKET: "your-cloud-bucket"
STORAGE_ACCESS_KEY_ID: "your-access-key"
STORAGE_SECRET_ACCESS_KEY: "your-secret-key"
STORAGE_REGION: "us-east-1"  # or your region
```

## Secrets

Create secrets based on your storage choice:

### In-Cluster MinIO
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

### Cloud Storage
Storage credentials are provided via the `STORAGE_ACCESS_KEY_ID` and `STORAGE_SECRET_ACCESS_KEY` in `app-secrets`.

## Cloud Storage Providers

### AWS S3
```yaml
STORAGE_ENDPOINT: ""  # Use AWS default
STORAGE_REGION: "us-east-1"
STORAGE_FORCE_PATH_STYLE: "false"
```

### Google Cloud Storage
```yaml
STORAGE_ENDPOINT: "https://storage.googleapis.com"
STORAGE_FORCE_PATH_STYLE: "true"
```

### Azure Blob Storage
```yaml
STORAGE_ENDPOINT: "https://youraccount.blob.core.windows.net"
STORAGE_FORCE_PATH_STYLE: "true"
```

## Storage

### In-Cluster MinIO
- Uses PersistentVolumeClaim with configurable storage class
- Default: 20Gi (10Gi for staging)
- Storage class must support ReadWriteOnce access mode

### Cloud Storage
- No Kubernetes storage needed
- Data managed by cloud provider
- Automatic replication and backup

## Backup & Recovery

### In-Cluster MinIO
- Implement backup strategies using:
  - `mc` (MinIO Client) for data backup
  - Volume snapshots for disaster recovery
  - Consider MinIO's built-in replication features

### Cloud Storage
- Backups handled by cloud provider
- Configure versioning and lifecycle policies
- Cross-region replication for disaster recovery

## Monitoring

Storage metrics can be collected using:
- MinIO's built-in metrics endpoint
- Cloud provider monitoring dashboards
- Application-level upload/download metrics

## Scaling

### In-Cluster MinIO
- Single replica by default (consider MinIO distributed mode for HA)
- Vertical scaling: Increase resource limits
- Horizontal scaling: Deploy multiple MinIO instances with load balancer

### Cloud Storage
- Scaling managed by cloud provider
- Virtually unlimited capacity
- Global CDN integration available

## Security

### MinIO Security
- Use strong passwords for root credentials
- Enable TLS in production
- Configure bucket policies
- Regular security updates

### Cloud Storage Security
- Use IAM roles/service accounts instead of access keys
- Enable bucket versioning
- Configure encryption at rest
- Regular audit logging
