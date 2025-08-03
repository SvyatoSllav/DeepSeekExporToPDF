#!/bin/bash

# Docker Setup Script for HTML to PDF API
# This script sets up the Docker environment for the API

set -e

echo "🐳 Setting up HTML to PDF API with Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

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

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

print_status "Docker environment check passed"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads
mkdir -p ssl
mkdir -p monitoring

# Create SSL certificates (self-signed for development)
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    print_status "Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem -out ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    print_success "SSL certificates generated"
fi

# Create Prometheus configuration
if [ ! -f monitoring/prometheus.yml ]; then
    print_status "Creating Prometheus configuration..."
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'html-to-pdf-api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 10s
EOF
    print_success "Prometheus configuration created"
fi

# Set proper permissions
print_status "Setting permissions..."
chmod 755 uploads
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

print_success "Docker setup completed!"

echo ""
echo "🚀 Available Docker Compose commands:"
echo ""
echo "📦 Development (with hot reload):"
echo "   docker-compose -f docker-compose.yml -f docker-compose.override.yml up"
echo ""
echo "🏭 Production:"
echo "   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo ""
echo "🧪 Testing:"
echo "   docker-compose -f docker-compose.test.yml up --abort-on-container-exit"
echo ""
echo "📊 With monitoring:"
echo "   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo ""
echo "🔧 Useful commands:"
echo "   docker-compose logs -f api          # View API logs"
echo "   docker-compose logs -f nginx        # View nginx logs"
echo "   docker-compose ps                   # List running containers"
echo "   docker-compose down                 # Stop all containers"
echo "   docker-compose restart api          # Restart API service"
echo ""
echo "🌐 Access points:"
echo "   API: http://localhost:3000"
echo "   Nginx: http://localhost:80 (or http://localhost:8080 in dev)"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3001 (admin/admin)"
echo "" 