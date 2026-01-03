# Kubernetes Cluster Setup Prerequisites

This directory contains all the necessary manifests and configurations to set up the required prerequisites for deploying the Video Meta Generate application to Kubernetes clusters.

## Overview

Before deploying the application, you need to set up the following cluster prerequisites:

1. **NGINX Ingress Controller** - For routing external traffic to services
2. **cert-manager** - For automatic TLS certificate management with Let's Encrypt
3. **metrics-server** - For Horizontal Pod Autoscaling (HPA) to work
4. **Storage Classes** - For persistent volume provisioning

## Quick Start

### Deploy All Prerequisites

```bash
# Deploy all cluster prerequisites
kubectl apply -k k8s/cluster-setup/

# Verify deployments
kubectl get pods -n ingress-nginx
kubectl get pods -n cert-manager
kubectl get pods -n kube-system -l k8s-app=metrics-server
kubectl get storageclass
```

### Deploy Prerequisites Individually

```bash
# 1. Deploy NGINX Ingress Controller
kubectl apply -k k8s/cluster-setup/ingress-controller/

# 2. Deploy cert-manager
kubectl apply -k k8s/cluster-setup/cert-manager/

# 3. Deploy metrics-server
kubectl apply -k k8s/cluster-setup/metrics-server/

# 4. Deploy storage classes (choose based on your cloud provider)
kubectl apply -k k8s/cluster-setup/storage-classes/
```

## Prerequisites by Component

### 1. NGINX Ingress Controller

**Purpose**: Routes external traffic to Kubernetes services based on host and path.

**Deployment**:
```bash
kubectl apply -k k8s/cluster-setup/ingress-controller/
```

**Verification**:
```bash
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

**Expected LoadBalancer IP/Service**:
```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### 2. cert-manager

**Purpose**: Automatically provisions and manages TLS certificates from Let's Encrypt.

**Important**: Update the email address in `cluster-issuers.yaml` before deployment!

**Deployment**:
```bash
kubectl apply -k k8s/cluster-setup/cert-manager/
```

**Verification**:
```bash
kubectl get pods -n cert-manager
kubectl get clusterissuer
```

### 3. metrics-server

**Purpose**: Enables Horizontal Pod Autoscaling by collecting resource metrics.

**Deployment**:
```bash
kubectl apply -k k8s/cluster-setup/metrics-server/
```

**Verification**:
```bash
kubectl get pods -n kube-system -l k8s-app=metrics-server
kubectl top nodes  # Should show CPU/Memory usage
kubectl top pods -A  # Should show pod metrics
```

### 4. Storage Classes

**Purpose**: Defines how persistent volumes are provisioned.

**Choose based on your cloud provider**:

#### AWS EKS
```bash
# Install AWS EBS CSI Driver first (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-ebs-csi-driver/master/deploy/kubernetes/overlays/stable/kustomization.yaml

# Then deploy storage classes
kubectl apply -f k8s/cluster-setup/storage-classes/cloud-specific/aws-storage-classes.yaml
kubectl patch storageclass aws-ebs-gp3 -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

#### Google GKE
```bash
# GKE has CSI driver pre-installed, just deploy storage classes
kubectl apply -f k8s/cluster-setup/storage-classes/cloud-specific/gcp-storage-classes.yaml
kubectl patch storageclass gcp-pd-ssd -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

#### Azure AKS
```bash
# AKS has CSI driver pre-installed, just deploy storage classes
kubectl apply -f k8s/cluster-setup/storage-classes/cloud-specific/azure-storage-classes.yaml
kubectl patch storageclass azure-premium-ssd -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

#### DigitalOcean DOKS
```bash
# Install DO CSI Driver first
kubectl apply -f https://raw.githubusercontent.com/digitalocean/csi-digitalocean/master/deploy/kubernetes/releases/csi-digitalocean-v4.2.0.yaml

# Then deploy storage classes
kubectl apply -f k8s/cluster-setup/storage-classes/cloud-specific/digitalocean-storage-classes.yaml
kubectl patch storageclass do-block-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

## Cloud Provider Specific Setup

### AWS EKS

1. **Install AWS EBS CSI Driver**:
```bash
# Option 1: Using eksctl
eksctl create addon --name aws-ebs-csi-driver --cluster <cluster-name> --service-account-role-arn <role-arn>

# Option 2: Manual installation
kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=master"
```

2. **IAM Permissions**: Ensure your worker nodes have the necessary IAM permissions for EBS operations.

### Google GKE

1. **CSI Driver**: Pre-installed in GKE clusters (version 1.18+).
2. **Workload Identity**: Configure Workload Identity for accessing GCP services if needed.

### Azure AKS

1. **CSI Driver**: Pre-installed in AKS clusters.
2. **Managed Identity**: Ensure your AKS cluster has the appropriate managed identity permissions.

### DigitalOcean DOKS

1. **CSI Driver Installation**:
```bash
kubectl apply -f https://raw.githubusercontent.com/digitalocean/csi-digitalocean/master/deploy/kubernetes/releases/csi-digitalocean-v4.2.0.yaml
```

2. **API Token**: Ensure your cluster has access to DigitalOcean API for volume operations.

## Validation

Use the provided validation script to check if all prerequisites are properly deployed:

```bash
# Make script executable (Windows: skip this step)
chmod +x k8s/cluster-setup/validate-setup.sh

# Run validation
./k8s/cluster-setup/validate-setup.sh
```

Or verify each component manually:

```bash
# Check NGINX Ingress Controller
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx

# Check cert-manager
kubectl get pods -n cert-manager
kubectl get clusterissuer

# Check metrics-server
kubectl get pods -n kube-system -l k8s-app=metrics-server
kubectl top nodes

# Check storage classes
kubectl get storageclass
```

## Troubleshooting

### Common Issues

1. **metrics-server can't connect to kubelet**:
   ```bash
   # Check if metrics-server is running
   kubectl logs -n kube-system deployment/metrics-server

   # For some clusters, you might need to add --kubelet-insecure-tls flag
   kubectl patch deployment metrics-server -n kube-system --type json -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
   ```

2. **cert-manager webhooks not working**:
   ```bash
   # Check cert-manager logs
   kubectl logs -n cert-manager deployment/cert-manager

   # Ensure cert-manager-webhook is running
   kubectl get pods -n cert-manager
   ```

3. **Storage class not provisioning volumes**:
   ```bash
   # Check storage class
   kubectl get storageclass

   # Check CSI driver pods
   kubectl get pods -A | grep csi
   ```

4. **Ingress not working**:
   ```bash
   # Check ingress controller logs
   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

   # Check ingress resources
   kubectl get ingress -A
   ```

## Next Steps

After setting up all prerequisites:

1. **Deploy the application**:
   ```bash
   kubectl apply -k k8s/overlays/staging/  # For staging
   kubectl apply -k k8s/overlays/production/  # For production
   ```

2. **Deploy monitoring stack**:
   ```bash
   kubectl apply -k k8s/monitoring/
   ```

3. **Set up CI/CD pipelines** to automate future deployments.

## Support

If you encounter issues:

1. Check the component-specific logs using `kubectl logs`
2. Verify cluster permissions and RBAC
3. Ensure your Kubernetes version is supported (1.24+ recommended)
4. Check the official documentation for each component

## Cleanup

To remove all cluster prerequisites:

```bash
kubectl delete -k k8s/cluster-setup/
```
