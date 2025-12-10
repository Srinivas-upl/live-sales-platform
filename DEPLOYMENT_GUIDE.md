# Live Sales Platform - AWS EC2 Deployment Guide

## 📋 Overview
This guide provides step-by-step instructions to deploy the Live Sales Platform on AWS EC2 with Docker, HTTPS/TLS, and security best practices.

## 🚀 Prerequisites

### 1. AWS Account Setup
- AWS Account with admin privileges
- IAM User with EC2, RDS, and Certificate Manager permissions
- AWS CLI installed and configured

### 2. Domain & SSL
- Registered domain name (e.g., `yourdomain.com`)
- AWS Route 53 for DNS management
- AWS Certificate Manager for SSL certificates

## 🔒 Security Architecture

### IAM Policies for EC2 Instance
Create an IAM Role with these policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeSecurityGroups",
        "cloudwatch:PutMetricData",
        "cloudwatch:GetMetricStatistics"
      ],
      "Resource": "*"
    }
  ]
}
```

### Security Group Configuration
Create Security Groups with minimal access:

**Application Security Group (app-sg):**
- Inbound: HTTP (80), HTTPS (443) from anywhere
- Inbound: SSH (22) from your IP only
- Outbound: All traffic

**Database Security Group (db-sg):** (if using RDS)
- Inbound: PostgreSQL/MySQL (3306/5432) from app-sg only
- Outbound: All traffic

## 🐳 Docker Production Setup

### 1. Update Docker Compose for Production
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  nginx-proxy:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/conf.d:/etc/nginx/conf.d
      - /etc/letsencrypt:/etc/letsencrypt:ro
    networks:
      - live-sales-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: live-sales-backend
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
      - PORT=3001
    volumes:
      - uploads:/app/uploads
    networks:
      - live-sales-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: live-sales-frontend
    environment:
      - VITE_API_URL=https://api.yourdomain.com
    networks:
      - live-sales-network
    restart: unless-stopped

networks:
  live-sales-network:
    driver: bridge

volumes:
  uploads:
  postgres_data:
```

### 2. Create Production Dockerfiles

**Backend Dockerfile.prod:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env.production ./.env

USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

**Frontend Dockerfile.prod:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Nginx Configuration
Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # Backend API Server
    upstream backend {
        server backend:3001;
    }

    # Frontend Server
    upstream frontend {
        server frontend:80;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Certificates
        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /images/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }
    }
}
```

## 🚀 EC2 Deployment Steps

### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. Choose Ubuntu 22.04 LTS
3. Select t3.medium (2 vCPU, 4GB RAM)
4. Configure Security Group:
   - SSH (22) - Your IP only
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
5. Create/use key pair
6. Launch instance

### Step 2: Configure EC2 Instance
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install AWS CLI (optional)
sudo apt install -y awscli

# Create app directory
mkdir -p /opt/live-sales-platform
cd /opt/live-sales-platform
```

### Step 3: Deploy Application
```bash
# Clone your repository
git clone https://github.com/yourusername/live-sales-platform.git .
git checkout production

# Create environment file
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/livesales
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EOF

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 4: Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --nginx \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --no-eff-email

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 5: Configure Domain & DNS
1. Go to AWS Route 53
2. Create hosted zone for your domain
3. Update nameservers with your domain registrar
4. Create A record pointing to EC2 public IP
5. Create CNAME for www subdomain

## 🔐 Security Hardening

### 1. SSH Security
```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Use key-based authentication only
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Change SSH port (optional)
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart sshd
```

### 2. Firewall Configuration (UFW)
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 3. Docker Security
```bash
# Create docker-compose.override.yml for security
cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    user: "1000:1000"
  
  frontend:
    security_opt:
      - no-new-privileges:true
    read_only: true
EOF
```

### 4. Database Security (if using RDS)
- Enable encryption at rest
- Enable automated backups
- Set backup retention period (7-35 days)
- Enable deletion protection
- Use IAM database authentication

## 📊 Monitoring & Logging

### 1. CloudWatch Logs
```bash
# Install CloudWatch agent
sudo apt install -y amazon-cloudwatch-agent

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Start agent
sudo systemctl start amazon-cloudwatch-agent
```

### 2. Application Logs
```bash
# View Docker logs
docker-compose -f docker-compose.prod.yml logs --tail=100 -f

# Set up log rotation
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
```

## 🔄 Backup Strategy

### 1. Database Backups
```bash
# Create backup script
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec postgres pg_dump -U postgres livesales > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/live-sales-platform/uploads

# Sync to S3
aws s3 sync $BACKUP_DIR s3://your-backup-bucket/live-sales/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete
EOF

# Make executable and schedule
chmod +x /opt/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -
```

### 2. S3 Bucket for Backups
```bash
# Create S3 bucket
aws s3 mb s3://your-backup-bucket

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket your-backup-bucket \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket your-backup-bucket \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

## 🚨 Incident Response

### 1. Monitoring Alerts
```bash
# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "HighCPUUsage" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:AlarmTopic
```

### 2. Security Incident Checklist
1. **Detect**: Monitor CloudWatch, VPC Flow Logs
2. **Contain**: Isolate instance, update security groups
3. **Eradicate**: Patch vulnerabilities, remove malware
4. **Recover**: Restore from backup, validate security
5. **Learn**: Document incident, update procedures

## 📈 Scaling Considerations

### 1. Vertical Scaling
- Upgrade EC2 instance type (t3.medium → t3.large)
- Increase EBS volume size
- Add RDS read replicas

### 2. Horizontal Scaling
```bash
# Create AMI from current instance
aws ec2 create-image \
  --instance-id i-1234567890abcdef0 \
  --name "live-sales-platform-$(date +%Y%m%d)" \
  --no-reboot

# Create Launch Template
# Configure Auto Scaling Group
# Set up Application Load Balancer
```

## 🎯 Maintenance Checklist

### Daily
- [ ] Check application logs
- [ ] Monitor CloudWatch metrics
- [ ] Verify backups completed
- [ ] Review security alerts

### Weekly
- [ ] Update system packages
- [ ] Update Docker images
- [ ] Review access logs
- [ ] Test backup restoration

### Monthly
- [ ] Rotate SSL certificates
- [ ] Rotate IAM credentials
- [ ] Security audit
- [ ] Performance review

## 📞 Support & Troubleshooting

### Common Issues:
1. **Application not starting**: Check Docker logs
2. **SSL certificate expired**: Renew with Certbot
3. **Database connection issues**: Check RDS/security groups
4. **High CPU usage**: Scale instance or optimize queries

### Useful Commands:
```bash
# Restart services
docker-compose -f docker-compose.prod.yml restart

# View resource usage
docker stats

# Check disk space
df -h

# Monitor network
sudo netstat -tulpn

# Check security updates
sudo apt list --upgradable
```

## 🏁 Conclusion
This deployment guide provides a production-ready setup for the Live Sales Platform with:
- ✅ Docker containerization
- ✅ HTTPS/TLS encryption
- ✅ AWS security best practices
- ✅ Automated backups
- ✅ Monitoring and alerting
- ✅ Scalability options

The application is now ready for public deployment with enterprise-grade security and reliability.

---
**Next Steps:**
1. Test deployment in staging environment
2. Configure CI/CD pipeline
3. Set up monitoring dashboard
4. Document API for developers
5. Create user documentation
