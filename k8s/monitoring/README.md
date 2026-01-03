# Monitoring Stack

This directory contains Kubernetes manifests for deploying a complete monitoring stack using Grafana, Loki, and Promtail.

## Components

### Grafana
- **Purpose**: Visualization and dashboards for logs and metrics
- **Access**: `https://grafana-staging.yourdomain.com` (staging) or `https://grafana.yourdomain.com` (production)
- **Default Credentials**: admin / (configured in secrets)

### Loki
- **Purpose**: Log aggregation and storage
- **Features**: 30-day retention, efficient compression, query language
- **Storage**: 20Gi PVC for log storage

### Promtail
- **Purpose**: Log collection agent that runs on every node
- **Sources**: Kubernetes pod logs, container logs, system logs
- **Integration**: Automatically discovers and labels logs by namespace, pod, container

## Deployment

### Deploy All Monitoring Components
```bash
kubectl apply -k k8s/monitoring/
```

### Deploy Individual Components
```bash
# Loki (log storage)
kubectl apply -k k8s/monitoring/loki/

# Promtail (log collection)
kubectl apply -k k8s/monitoring/promtail/

# Grafana (visualization)
kubectl apply -k k8s/monitoring/grafana/

# Ingress (external access)
kubectl apply -k k8s/monitoring/ingress/
```

## Configuration

### Grafana Secrets
Create the Grafana secrets before deployment:

```bash
kubectl apply -f k8s/secrets/grafana-secret-template.yaml
# Edit the template with your desired admin password
```

### Log Retention
Loki is configured with 30-day log retention. To modify:

```yaml
# In k8s/monitoring/loki/configmap.yaml
limits_config:
  retention_period: 720h  # 30 days
```

### Storage
Each component uses PVCs with configurable storage:
- **Loki**: 20Gi (log storage)
- **Grafana**: 10Gi (dashboards, users, configurations)

## Access

### Grafana UI
1. **Staging**: `https://grafana-staging.yourdomain.com`
2. **Production**: `https://grafana.yourdomain.com`
3. **Local**: `kubectl port-forward -n monitoring svc/grafana 3000:3000`

### Default Login
- **Username**: admin (configurable via secret)
- **Password**: Configured in `grafana-secrets`

## Dashboards

### Pre-configured Data Sources
- **Loki**: Automatically configured for log queries

### Creating Dashboards
1. Go to Grafana UI → Create → Dashboard
2. Add panels with Loki queries, e.g.:
   ```
   {namespace="staging", container="app"} |= "ERROR"
   ```

## Log Queries

### Basic Queries
```logql
# All logs from staging namespace
{namespace="staging"}

# Error logs from app container
{namespace="staging", container="app"} |= "ERROR"

# HTTP requests with status codes
{namespace="staging", container="app"} |= "GET" |= "POST"
```

### Advanced Queries
```logql
# Count errors per hour
count_over_time({namespace="staging"} |= "ERROR" [1h])

# Logs from specific pod
{namespace="staging", pod="video-meta-app-12345-abcde"}

# Filter by time range
{namespace="staging"} |= "ERROR" |= "WARN"
```

## Monitoring Application Logs

### Automatic Log Collection
Promtail automatically collects logs from:
- All Kubernetes pods
- Container stdout/stderr
- System logs

### Log Labels
Each log entry is automatically labeled with:
- `namespace`: Kubernetes namespace
- `pod`: Pod name
- `container`: Container name
- `job`: Combined namespace/pod identifier

## Troubleshooting

### Grafana Not Accessible
```bash
# Check Grafana pod status
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana

# Check Grafana logs
kubectl logs -n monitoring deployment/grafana

# Check ingress
kubectl describe ingress grafana-ingress -n monitoring
```

### No Logs in Grafana
```bash
# Check Loki pod status
kubectl get pods -n monitoring -l app.kubernetes.io/name=loki

# Check Promtail pods
kubectl get pods -n monitoring -l app.kubernetes.io/name=promtail

# Verify log collection
kubectl logs -n monitoring daemonset/promtail
```

### Storage Issues
```bash
# Check PVC status
kubectl get pvc -n monitoring

# Check storage class
kubectl get storageclass
```

## Scaling

### Loki
- Single replica by default (suitable for most workloads)
- For high-volume logging, consider distributed Loki

### Promtail
- DaemonSet automatically scales with cluster nodes
- One Promtail instance per node

### Grafana
- Single replica by default
- Can be scaled horizontally if needed

## Security

### Network Policies
Consider implementing network policies to restrict access:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: monitoring-access
  namespace: monitoring
spec:
  podSelector: {}
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: staging  # Allow from staging namespace
```

### Authentication
- Configure OAuth for production use
- Use strong passwords
- Enable HTTPS-only access

## Backup & Recovery

### Grafana
- Dashboards and configurations stored in PVC
- Export dashboards as JSON for backup

### Loki
- Logs stored in PVC with configurable retention
- Consider external storage for production backups

## Performance Tuning

### Loki
- Increase memory limits for high log volumes
- Tune retention periods based on storage capacity
- Use chunk compression for storage efficiency

### Promtail
- Adjust scrape intervals if needed
- Monitor resource usage per node
