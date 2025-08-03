#!/bin/bash

# HTML to PDF API Setup Script
# This script sets up the API server with nginx

echo "🚀 Setting up HTML to PDF API with nginx..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt update

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    sudo apt install -y nginx
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads

# Copy nginx configuration
echo "⚙️ Configuring nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/html-to-pdf-api
sudo ln -sf /etc/nginx/sites-available/html-to-pdf-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration is invalid"
    exit 1
fi

# Copy systemd service file
echo "⚙️ Setting up systemd service..."
sudo cp html-to-pdf-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable html-to-pdf-api.service

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /home/svyat/dev/for_testing
sudo chmod -R 755 /home/svyat/dev/for_testing

# Start services
echo "🚀 Starting services..."
sudo systemctl start html-to-pdf-api.service
sudo systemctl restart nginx

# Check service status
echo "📊 Checking service status..."
sudo systemctl status html-to-pdf-api.service --no-pager -l

echo "✅ Setup complete!"
echo ""
echo "🌐 API is now available at:"
echo "   http://localhost/api/"
echo ""
echo "📖 Available endpoints:"
echo "   POST /api/convert/string - Convert HTML string to PDF"
echo "   POST /api/convert/file   - Convert HTML file to PDF"
echo "   POST /api/convert/url    - Convert URL to PDF"
echo "   GET  /api/options        - Get available options"
echo "   GET  /health             - Health check"
echo ""
echo "🔧 Useful commands:"
echo "   sudo systemctl status html-to-pdf-api.service"
echo "   sudo systemctl restart html-to-pdf-api.service"
echo "   sudo systemctl restart nginx"
echo "   sudo journalctl -u html-to-pdf-api.service -f" 