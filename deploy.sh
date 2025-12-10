#!/bin/bash

# Live Sales Platform Deployment Script
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
DOMAIN="yourdomain.com"
EMAIL="srinivas@ylive-sale1234.com"

# Git Configuration - Update these for your private repository
GIT_REPO_URL="https://Srinivas-upl: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@github.com/Srinivas-upl/live-sales-platform.git"
# For private repos, you can use one of these authentication methods:
# 1. SSH: git@github.com:username/repo.git (requires SSH key setup)
# 2. HTTPS with PAT: https://username:token@github.com/username/repo.git
# 3. HTTPS with credentials in .git-credentials

# Uncomment and set your preferred authentication method:
# GIT_REPO_URL="git@github.com:yourusername/live-sales-platform.git"  # SSH
# GIT_REPO_URL="https://yourusername:your-token@github.com/yourusername/live-sales-platform.git"  # HTTPS with PAT

# Optional Features - Set to "true" or "false"
ENABLE_BACKUPS="false"  # Set to "true" if you want automatic backups

echo "🚀 Deploying Live Sales Platform ($ENVIRONMENT)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root. Use sudo for specific commands."
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    sudo apt install -y docker.io docker-compose
    sudo usermod -aG docker $USER
    newgrp docker
else
    print_status "Docker already installed"
fi

# Create application directory
APP_DIR="/opt/live-sales-platform"
print_status "Setting up application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR
cd $APP_DIR

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git pull origin main
else
    print_status "Cloning repository from $GIT_REPO_URL..."
    
    # Check if SSH key is needed for private repo
    if [[ "$GIT_REPO_URL" == git@* ]]; then
        print_warning "Using SSH URL. Ensure SSH key is set up on the server."
        print_warning "To set up SSH key:"
        print_warning "1. Generate SSH key: ssh-keygen -t ed25519 -C 'your-email@example.com'"
        print_warning "2. Add public key to GitHub: cat ~/.ssh/id_ed25519.pub"
        print_warning "3. Test connection: ssh -T git@github.com"
    fi
    
    git clone "$GIT_REPO_URL" .
    
    if [ $? -ne 0 ]; then
        print_error "Failed to clone repository. Possible issues:"
        print_error "1. Repository URL is incorrect"
        print_error "2. Authentication failed (private repo)"
        print_error "3. Network connectivity issues"
        print_error ""
        print_error "For private repositories, use one of these methods:"
        print_error "1. SSH: git@github.com:username/repo.git (requires SSH key)"
        print_error "2. HTTPS with PAT: https://username:token@github.com/username/repo.git"
        print_error "3. Configure git credentials: git config --global credential.helper store"
        exit 1
    fi
fi

# Ensure package-lock.json files are valid and up to date
print_status "Checking package-lock.json files..."
if [ -f "frontend/package.json" ] && [ ! -f "frontend/package-lock.json" ]; then
    print_warning "frontend/package-lock.json missing. Generating..."
    cd frontend && npm install --package-lock-only && cd ..
fi

if [ -f "backend/package.json" ] && [ ! -f "backend/package-lock.json" ]; then
    print_warning "backend/package-lock.json missing. Generating..."
    cd backend && npm install --package-lock-only --only=production && cd ..
fi

# Setup environment variables
print_status "Setting up environment variables..."

# Create backend .env
if [ ! -f ".env" ]; then
    cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_URL=sqlite:///app/lspd.db
PORT=3001
UPLOAD_DIR=/app/uploads
EOF
    print_status "Created backend .env file"
else
    print_status "Backend .env file already exists"
fi

# Create necessary directories (only essential ones)
print_status "Creating necessary directories..."
mkdir -p uploads nginx/ssl
if [ "$ENABLE_BACKUPS" = "true" ]; then
    mkdir -p backups
    print_status "Backups directory created (backups enabled)"
else
    print_status "Skipping backups directory creation (backups disabled)"
fi

# Create frontend .env.production
if [ "$DOMAIN" != "yourdomain.com" ]; then
    cat > frontend/.env.production << EOF
VITE_API_URL=https://$DOMAIN
EOF
    print_status "Created frontend .env.production with HTTPS URL: https://$DOMAIN"
else
    cat > frontend/.env.production << EOF
VITE_API_URL=http://localhost:3001
EOF
    print_warning "Using default domain. Frontend will use HTTP for API calls."
fi

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Install Certbot if not installed
    if ! command -v certbot &> /dev/null; then
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Request certificate
    sudo certbot certonly --nginx \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --non-interactive || {
        print_warning "SSL certificate setup failed. Continuing without SSL..."
        return 1
    }
    
    # Create symlinks for Docker
    sudo ln -sf /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/nginx/ssl/fullchain.pem
    sudo ln -sf /etc/letsencrypt/live/$DOMAIN/privkey.pem $APP_DIR/nginx/ssl/privkey.pem
    
    # Setup auto-renewal
    (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
    
    print_status "SSL certificates configured"
}

# Setup Nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    if [ "$DOMAIN" != "yourdomain.com" ]; then
        # With domain - HTTPS configuration
        cat > nginx/nginx.conf << 'EOF'
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
        server_name $DOMAIN www.$DOMAIN;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN www.$DOMAIN;

        # SSL Certificates
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_buffering off;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_buffering off;
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
EOF
        print_status "Created HTTPS Nginx configuration for domain: $DOMAIN"
    else
        # Without domain - HTTP only configuration
        cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Backend API Server
    upstream backend {
        server backend:3001;
    }

    # Frontend Server
    upstream frontend {
        server frontend:80;
    }

    # HTTP Server (no SSL)
    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_buffering off;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_buffering off;
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
EOF
        print_status "Created HTTP Nginx configuration for localhost"
    fi
}

# Setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    sudo apt install -y ufw
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow 22/tcp  # SSH
    sudo ufw allow 80/tcp  # HTTP
    sudo ufw allow 443/tcp # HTTPS
    echo "y" | sudo ufw enable
    
    print_status "Firewall configured"
}

# Create production docker-compose
create_production_compose() {
    print_status "Creating production docker-compose.yml..."
    
    cat > docker-compose.prod.yml << 'EOF'
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
    networks:
      - live-sales-network
    restart: unless-stopped
    depends_on:
      - backend
      - frontend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: live-sales-backend
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3001
    volumes:
      - ./uploads:/app/uploads
      - ./lspd.db:/app/lspd.db
    networks:
      - live-sales-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: live-sales-frontend
    networks:
      - live-sales-network
    restart: unless-stopped

networks:
  live-sales-network:
    driver: bridge
EOF
    
    print_status "Production docker-compose.yml created"
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/live-sales-platform/backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup_$DATE.log"

mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)" > $LOG_FILE

# Backup database
if [ -f "lspd.db" ]; then
    cp lspd.db "$BACKUP_DIR/lspd_$DATE.db"
    echo "Database backed up" >> $LOG_FILE
fi

# Backup uploads
if [ -d "uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" uploads/
    echo "Uploads backed up" >> $LOG_FILE
fi

# Backup environment
if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/env_$DATE.backup"
    echo "Environment backed up" >> $LOG_FILE
fi

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete
find $BACKUP_DIR -name "*.log" -mtime +30 -delete

echo "Backup completed at $(date)" >> $LOG_FILE
echo "Backup size: $(du -sh $BACKUP_DIR | cut -f1)" >> $LOG_FILE
EOF
    
    chmod +x backup.sh
    
    # Schedule daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $APP_DIR && ./backup.sh") | crontab -
    
    print_status "Backup script created and scheduled"
}

# Main deployment function
deploy() {
    print_status "Starting deployment process..."
    
    # Setup SSL (skip if domain not configured)
    if [ "$DOMAIN" != "yourdomain.com" ]; then
        setup_ssl
    else
        print_warning "Using default domain. SSL setup skipped."
    fi
    
    setup_nginx
    setup_firewall
    create_production_compose
    create_backup_script
    
    # Build and start services
    print_status "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build
    
    print_status "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to start
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check service status
    print_status "Checking service status..."
    docker-compose -f docker-compose.prod.yml ps
    
    # Show deployment info
    print_status "Deployment completed!"
    echo ""
    echo "📊 Deployment Summary:"
    echo "----------------------"
    
    if [ "$DOMAIN" != "yourdomain.com" ]; then
        echo "Application URL: https://$DOMAIN"
        echo "Backend API: https://$DOMAIN/api"
        echo "Frontend: https://$DOMAIN"
        echo ""
        echo "📝 Next Steps:"
        echo "-------------"
        echo "1. Update DNS records to point to $(curl -s ifconfig.me)"
        echo "2. Configure your domain: $DOMAIN"
        echo "3. Test the application at https://$DOMAIN"
        echo "4. Review security settings in DEPLOYMENT_GUIDE.md"
    else
        SERVER_IP=$(curl -s ifconfig.me)
        echo "Application URL: http://$SERVER_IP"
        echo "Backend API: http://$SERVER_IP/api"
        echo "Frontend: http://$SERVER_IP"
        echo ""
        echo "📝 Next Steps:"
        echo "-------------"
        echo "1. Access the application at http://$SERVER_IP"
        echo "2. To use with a domain, update DOMAIN variable in deploy.sh"
        echo "3. For HTTPS, set DOMAIN to your domain name and rerun deploy.sh"
        echo "4. Review security settings in DEPLOYMENT_GUIDE.md"
    fi
    
    echo ""
    echo "🔧 Management Commands:"
    echo "----------------------"
    echo "View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "Stop: docker-compose -f docker-compose.prod.yml down"
    echo "Backup: ./backup.sh"
}

# Run deployment
deploy

print_status "Live Sales Platform deployment completed successfully!"
echo ""
echo "For detailed configuration, refer to DEPLOYMENT_GUIDE.md"
echo "For troubleshooting, check logs: docker-compose -f docker-compose.prod.yml logs"
