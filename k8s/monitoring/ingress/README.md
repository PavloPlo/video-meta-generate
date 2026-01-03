# Monitoring Ingress Configuration

This directory contains ingress configurations for accessing monitoring services (Grafana) from outside the Kubernetes cluster.

## Services Exposed

### Grafana
- **Staging**: `https://grafana-staging.video-meta.example.com`
- **Production**: `https://grafana.video-meta.example.com`

## Security Features

### Staging Environment
- Let's Encrypt TLS certificates (staging)
- Basic authentication (username/password)
- Basic security headers

### Production Environment
- Let's Encrypt TLS certificates (production)
- HTTP Strict Transport Security (HSTS)
- Rate limiting (100 requests/minute)
- Comprehensive security headers
- Content Security Policy
- XSS protection
- Frame options

## Authentication

### Staging
Uses basic authentication with a secret. To generate credentials:

```bash
# Install apache2-utils (on Ubuntu/Debian)
sudo apt-get install apache2-utils

# Generate htpasswd
htpasswd -nb username password

# Base64 encode the result
echo "username:password" | base64

# Update the secret in staging-grafana-auth.yaml
```

### Production
Grafana's built-in authentication should be used for production. Consider:
- OAuth integration (Google, GitHub, etc.)
- LDAP/Active Directory integration
- Multi-factor authentication

## TLS Certificates

Certificates are automatically provisioned by cert-manager using Let's Encrypt:

- **Staging**: Uses Let's Encrypt staging environment (for testing)
- **Production**: Uses Let's Encrypt production environment

## Deployment

### Staging
```bash
kubectl apply -f k8s/monitoring/ingress/staging-grafana-ingress.yaml
kubectl apply -f k8s/monitoring/ingress/staging-grafana-auth.yaml
```

### Production
```bash
kubectl apply -f k8s/monitoring/ingress/production-grafana-ingress.yaml
```

### Both Environments
```bash
kubectl apply -k k8s/monitoring/ingress/
```

## DNS Configuration

Ensure your DNS provider has the following records:

```
grafana-staging.video-meta.example.com.  A  YOUR_LOAD_BALANCER_IP
grafana.video-meta.example.com.         A  YOUR_LOAD_BALANCER_IP
```

## Troubleshooting

### Certificate Issues
```bash
# Check certificate status
kubectl get certificate -n monitoring

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Check ingress status
kubectl describe ingress grafana-ingress -n monitoring
```

### Authentication Issues
```bash
# Check basic auth secret
kubectl get secret grafana-auth -n monitoring -o yaml

# Verify ingress annotations
kubectl describe ingress grafana-ingress -n monitoring
```

### Connection Issues
```bash
# Check Grafana service
kubectl get svc grafana -n monitoring

# Check Grafana pods
kubectl get pods -n monitoring -l app=grafana

# Test connectivity
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Then visit http://localhost:3000
```

## Additional Security Considerations

### Network Policies
Consider implementing Kubernetes Network Policies to restrict traffic to monitoring services.

### IP Whitelisting
For production, consider adding IP whitelisting:
```yaml
nginx.ingress.kubernetes.io/whitelist-source-range: "YOUR_IP_RANGE"
```

### Monitoring Access Logs
Enable access logging for security auditing:
```yaml
nginx.ingress.kubernetes.io/enable-access-log: "true"
```
