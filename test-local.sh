#!/bin/bash

# Live Sales Platform Local Test Script
# For testing on macOS/local machine
# Usage: ./test-local.sh

set -e

echo "🧪 Testing Live Sales Platform (Local)"

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

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed."
    exit 1
fi

print_status "Docker Compose is available"

# Check environment files
print_status "Checking environment files..."

if [ -f ".env" ]; then
    print_status "Backend .env file exists"
    echo "Contents:"
    cat .env
else
    print_warning "Backend .env file missing"
fi

if [ -f "frontend/.env" ]; then
    print_status "Frontend .env file exists"
    echo "Contents:"
    cat frontend/.env
else
    print_warning "Frontend .env file missing"
fi

# Check Dockerfiles
print_status "Checking Dockerfiles..."

if [ -f "backend/Dockerfile" ]; then
    print_status "Backend Dockerfile exists"
else
    print_error "Backend Dockerfile missing"
fi

if [ -f "frontend/Dockerfile" ]; then
    print_status "Frontend Dockerfile exists"
else
    print_error "Frontend Dockerfile missing"
fi

# Check docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    print_status "docker-compose.yml exists"
    echo ""
    echo "docker-compose.yml contents:"
    echo "---------------------------"
    head -30 docker-compose.yml
else
    print_error "docker-compose.yml missing"
fi

# Test Docker build (dry run)
print_status "Testing Docker build (dry run)..."
echo "This will check if Docker can build the images without errors."

# Create test directory structure
print_status "Creating test directory structure..."
mkdir -p test-uploads

# Test backend build
print_status "Testing backend Docker build..."
cd backend
if docker build --no-cache --progress=plain -t test-backend . > /tmp/backend-build.log 2>&1; then
    print_status "Backend Docker build successful"
else
    print_error "Backend Docker build failed"
    echo "Build log:"
    cat /tmp/backend-build.log | tail -20
    cd ..
    exit 1
fi
cd ..

# Test frontend build  
print_status "Testing frontend Docker build..."
cd frontend
if docker build --no-cache --progress=plain -t test-frontend . > /tmp/frontend-build.log 2>&1; then
    print_status "Frontend Docker build successful"
else
    print_error "Frontend Docker build failed"
    echo "Build log:"
    cat /tmp/frontend-build.log | tail -20
    cd ..
    exit 1
fi
cd ..

# Clean up test images
print_status "Cleaning up test images..."
docker rmi test-backend test-frontend > /dev/null 2>&1 || true

# Test docker-compose configuration
print_status "Testing docker-compose configuration..."
if docker-compose config > /dev/null 2>&1; then
    print_status "docker-compose configuration is valid"
else
    print_error "docker-compose configuration is invalid"
    exit 1
fi

# Show what would be deployed
print_status "Deployment summary:"
echo ""
echo "📊 What would be deployed:"
echo "-------------------------"
echo "1. Backend service:"
echo "   - Image: Built from backend/Dockerfile"
echo "   - Port: 3001"
echo "   - Environment: .env file"
echo ""
echo "2. Frontend service:"
echo "   - Image: Built from frontend/Dockerfile"
echo "   - Port: 3000"
echo "   - Environment: frontend/.env file"
echo ""
echo "3. Database:"
echo "   - SQLite database: lspd.db"
echo "   - Uploads directory: uploads/"
echo ""
echo "🔧 To actually deploy locally:"
echo "------------------------------"
echo "1. Build and start: docker-compose up -d --build"
echo "2. View logs: docker-compose logs -f"
echo "3. Stop: docker-compose down"
echo "4. Access: http://localhost:3000"
echo "5. API: http://localhost:3001"
echo ""
print_status "Local test completed successfully!"
echo ""
echo "✅ All checks passed - Ready for local deployment"
