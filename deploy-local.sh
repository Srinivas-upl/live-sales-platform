#!/bin/bash

# Live Sales Platform Local Deployment Script
# For local development on macOS
# Usage: ./deploy-local.sh

set -e

echo "🚀 Deploying Live Sales Platform (Local Development)"

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

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_status "Docker is running"

# Check if services are already running
if docker-compose ps | grep -q "Up"; then
    print_warning "Services are already running. Stopping them first..."
    docker-compose down
    sleep 2
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p ~/Desktop/live-sales-data/uploads

# Build and start services
print_status "Building Docker images..."
docker-compose build

print_status "Starting services..."
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Check service status
print_status "Checking service status..."
docker-compose ps

# Show deployment info
print_status "Deployment completed!"
echo ""
echo "📊 Deployment Summary:"
echo "----------------------"
echo "Application URL: http://localhost:3002"
echo "Backend API: http://localhost:3002"
echo "Frontend: http://localhost:3002"
echo ""
echo "📝 Access Instructions:"
echo "----------------------"
echo "1. Open browser and go to: http://localhost:3002"
echo "2. Backend API is available at: http://localhost:3002/api"
echo "3. Database file: ~/Desktop/live-sales-data/lspd.db"
echo "4. Uploads directory: ~/Desktop/live-sales-data/uploads"
echo ""
echo "🔧 Management Commands:"
echo "----------------------"
echo "View logs: docker-compose logs -f"
echo "View backend logs: docker-compose logs -f backend"
echo "View frontend logs: docker-compose logs -f frontend"
echo "Restart services: docker-compose restart"
echo "Stop services: docker-compose down"
echo "Rebuild and restart: docker-compose up -d --build"
echo ""
echo "🔍 Testing the deployment:"
echo "-------------------------"
echo "1. Check if backend is healthy:"
echo "   curl http://localhost:3002/api/products"
echo ""
echo "2. Check frontend is serving:"
echo "   curl -I http://localhost:3002"
echo ""
echo "3. View all running containers:"
echo "   docker ps"
echo ""
echo "⚠️  Note: Port 3002 is used (not 3000) to avoid conflicts"
echo "   with the development server running on port 3000"
echo ""
print_status "Local deployment completed successfully!"
