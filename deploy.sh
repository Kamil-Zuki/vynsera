#!/bin/bash

# Vynsera Deployment Script
# This script deploys the Korean Language Learning website to a VPS

set -e

echo "🚀 Starting Vynsera deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 22+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Installing dependencies..."
npm ci

print_status "Running linter..."
npm run lint

print_status "Running type check..."
npm run type-check

print_status "Building application..."
npm run build

print_status "Stopping existing containers..."
docker-compose down || true

print_status "Building and starting containers..."
docker-compose up -d --build

print_status "Cleaning up unused Docker resources..."
docker system prune -f

print_status "Checking container status..."
docker-compose ps

print_status "Deployment completed successfully! 🎉"
print_status "Your Korean Language Learning website is now running at:"
print_status "  - HTTP: http://localhost"
print_status "  - HTTPS: https://localhost (if SSL is configured)"

print_warning "Don't forget to:"
print_warning "  1. Configure your domain name in nginx.conf"
print_warning "  2. Set up SSL certificates in the ssl/ directory"
print_warning "  3. Configure environment variables if needed"
print_warning "  4. Set up monitoring and backups"

echo ""
print_status "To view logs: docker-compose logs -f"
print_status "To stop: docker-compose down"
print_status "To restart: docker-compose restart"
