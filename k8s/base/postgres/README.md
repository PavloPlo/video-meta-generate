# PostgreSQL Database Configuration

This directory contains Kubernetes manifests for PostgreSQL database deployment with support for different deployment strategies.

## Deployment Options

### Option A: In-Cluster PostgreSQL (Staging)
- **Use Case**: Development, staging, cost-sensitive environments
- **Pros**: Self-contained, no external dependencies
- **Cons**: Requires cluster resources, backup management
- **Configuration**: Uses StatefulSet with persistent storage

### Option B: Managed Database (Production)
- **Use Case**: Production environments
- **Pros**: Managed by cloud provider, high availability, automated backups
- **Cons**: Additional cost, external dependency
- **Configuration**: No Kubernetes deployment, uses external connection

## Usage

### Staging (In-Cluster PostgreSQL)
```bash
kubectl apply -k overlays/staging/postgres/
```

### Production (Managed Database)
Production uses managed databases - no PostgreSQL deployment needed in Kubernetes.

## Environment Variables

The application expects these database environment variables:

```yaml
DATABASE_URL: "postgresql://user:password@host:5432/database"
DIRECT_URL: "postgresql://user:password@host:5432/database"  # For migrations
```

### For In-Cluster PostgreSQL
- **Host**: `postgres.staging.svc.cluster.local` (staging)
- **Port**: `5432`
- **Database**: Configured via `POSTGRES_DB` secret
- **User**: Configured via `POSTGRES_USER` secret

### For Managed Databases
- Use the connection string provided by your cloud provider
- Examples: AWS RDS, Google Cloud SQL, Azure Database

## Secrets

Create secrets based on your database choice:

### In-Cluster PostgreSQL
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

### Managed Database
The `postgres-secrets` secret is not needed for managed databases. Database credentials are provided via the `DATABASE_URL` and `DIRECT_URL` in `app-secrets`.

## Storage

### In-Cluster PostgreSQL
- Uses PersistentVolumeClaim with configurable storage class
- Default: 10Gi (5Gi for staging)
- Storage class must support ReadWriteOnce access mode

### Managed Database
- No Kubernetes storage needed
- Data managed by cloud provider

## Backup & Recovery

### In-Cluster PostgreSQL
- Implement your own backup strategy using tools like:
  - `pg_dump` for logical backups
  - Volume snapshots for physical backups
  - Consider operators like Zalando Postgres Operator

### Managed Database
- Backups handled by cloud provider
- Configure automated backups in your cloud console

## Monitoring

PostgreSQL metrics can be collected using:
- Prometheus postgres_exporter
- Built-in cloud provider monitoring
- Application-level query metrics

## Scaling

### In-Cluster PostgreSQL
- Vertical scaling: Increase resource limits
- Horizontal scaling: Connection pooling (PgBouncer) + read replicas

### Managed Database
- Scaling managed by cloud provider
- Configure via cloud console or APIs
