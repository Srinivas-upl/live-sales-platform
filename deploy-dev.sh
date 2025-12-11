#!/bin/bash

# Live Sales Platform Development Deployment Script
# Simplified version for EC2 testing
# Usage: ./deploy-dev.sh

set -e

echo "🚀 Deploying Live Sales Platform (Development/Testing)"

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

# Git Configuration - Update these for your private repository
GIT_REPO_URL="https://Srinivas-upl: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@github.com/Srinivas-upl/live-sales-platform.git"

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git pull origin main
else
    print_status "Cloning repository from $GIT_REPO_URL..."
    
    git clone "$GIT_REPO_URL" .
    
    if [ $? -ne 0 ]; then
        print_error "Failed to clone repository. Possible issues:"
        print_error "1. Repository URL is incorrect"
        print_error "2. Authentication failed (private repo)"
        print_error "3. Network connectivity issues"
        print_error ""
        print_error "For private repositories, you can use:"
        print_error "HTTPS with PAT: https://username:token@github.com/username/repo.git"
        exit 1
    fi
fi

# Setup environment variables
print_status "Setting up environment variables..."

# Create backend .env if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOF
NODE_ENV=development
JWT_SECRET=dev-test-secret-change-in-production
DATABASE_URL=sqlite:///app/lspd.db
PORT=3001
UPLOAD_DIR=/app/uploads
EOF
    print_status "Created backend .env file (development mode)"
else
    print_status "Backend .env file already exists"
fi

# Create frontend .env if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    SERVER_IP=$(curl -s ifconfig.me)
    cat > frontend/.env << EOF
VITE_API_URL=http://${SERVER_IP}:3001
EOF
    print_status "Created frontend .env with server IP: http://${SERVER_IP}:3001"
else
    print_status "Frontend .env file already exists"
fi

# Create necessary directories with proper permissions
print_status "Creating necessary directories..."
mkdir -p uploads data

# Create initial database file with proper permissions
print_status "Creating initial database file..."
touch data/lspd.db
chmod 666 data/lspd.db  # Allow read/write for all (Docker container runs as different user)
print_status "Database file created with proper permissions"

# Build and start services using EC2-specific compose file
print_status "Building Docker images..."
docker-compose -f docker-compose.ec2.yml build

print_status "Starting services..."
docker-compose -f docker-compose.ec2.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 15

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.ec2.yml ps

# Show deployment info
print_status "Deployment completed!"
echo ""
echo "📊 Deployment Summary:"
echo "----------------------"
SERVER_IP=$(curl -s ifconfig.me)
echo "Application URL: http://${SERVER_IP}"
echo "Backend API: http://${SERVER_IP}:3001"
echo "Frontend: http://${SERVER_IP}"
echo ""
echo "📝 Access Instructions:"
echo "----------------------"
echo "1. Open browser and go to: http://${SERVER_IP}"
echo "2. Backend API is available at: http://${SERVER_IP}:3001"
echo "3. Uploads directory: /opt/live-sales-platform/uploads"
echo ""
echo "🔧 Management Commands:"
echo "----------------------"
echo "View logs: docker-compose -f docker-compose.ec2.yml logs -f"
echo "View specific service logs: docker-compose -f docker-compose.ec2.yml logs -f backend"
echo "Restart services: docker-compose -f docker-compose.ec2.yml restart"
echo "Stop services: docker-compose -f docker-compose.ec2.yml down"
echo "Rebuild and restart: docker-compose -f docker-compose.ec2.yml up -d --build"
echo ""
echo "⚠️  Development Mode Notes:"
echo "-------------------------"
echo "1. Running in DEVELOPMENT mode (not production)"
echo "2. JWT secret is not secure - change for production"
echo "3. No SSL/HTTPS configured"
echo "4. No firewall rules configured"
echo "5. No backups scheduled"
echo ""
echo "For production deployment, use the full deploy.sh script"
echo "For troubleshooting, check logs: docker-compose -f docker-compose.ec2.yml logs"
