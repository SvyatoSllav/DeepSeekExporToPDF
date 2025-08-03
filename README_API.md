# HTML to PDF API Server

A RESTful API server for converting HTML to PDF using [puppeteer-html-pdf](https://www.npmjs.com/package/puppeteer-html-pdf) with full style preservation, served through nginx.

## Features

- ✅ **Full CSS Style Preservation** - All styles, colors, fonts, and layouts are preserved
- ✅ **JavaScript Rendering** - Dynamic content and JavaScript-heavy pages
- ✅ **Multiple Input Sources** - HTML strings, files, and URLs
- ✅ **Custom PDF Options** - Format, orientation, margins, scaling
- ✅ **Production Ready** - nginx reverse proxy with security headers
- ✅ **Rate Limiting** - Built-in protection against abuse
- ✅ **File Upload Support** - Multipart form data for HTML files
- ✅ **Health Monitoring** - Built-in health check endpoints

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Setup Script

```bash
chmod +x setup_api.sh
./setup_api.sh
```

### 3. Test the API

```bash
node test_api.js
```

## API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-03T15:30:00.000Z",
  "service": "HTML to PDF API"
}
```

### Get Available Options
```http
GET /api/options
```

**Response:**
```json
{
  "formats": ["A4", "Letter", "Legal", "Tabloid", "Ledger", "A0", "A1", "A2", "A3", "A5", "A6"],
  "orientations": ["portrait", "landscape"],
  "defaultOptions": {
    "format": "A4",
    "orientation": "portrait",
    "margin": { "top": "20px", "bottom": "20px", "left": "20px", "right": "20px" },
    "printBackground": true,
    "scale": 1.0,
    "timeout": 30000
  }
}
```

### Convert HTML String to PDF
```http
POST /api/convert/string
Content-Type: application/json

{
  "html": "<html><body><h1>Hello World</h1></body></html>",
  "options": {
    "format": "A4",
    "orientation": "portrait",
    "margin": { "top": "20px", "bottom": "20px", "left": "20px", "right": "20px" },
    "printBackground": true,
    "scale": 1.0
  }
}
```

### Convert HTML File to PDF
```http
POST /api/convert/file
Content-Type: multipart/form-data

Form Data:
- htmlFile: [HTML file]
- options: {"format": "A4", "printBackground": true}
```

### Convert URL to PDF
```http
POST /api/convert/url
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    "format": "A4",
    "printBackground": true
  }
}
```

## Usage Examples

### cURL Examples

#### Convert HTML String
```bash
curl -X POST http://localhost/api/convert/string \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Hello World</h1></body></html>",
    "options": {"format": "A4", "printBackground": true}
  }' \
  --output converted.pdf
```

#### Convert HTML File
```bash
curl -X POST http://localhost/api/convert/file \
  -F "htmlFile=@sample.html" \
  -F 'options={"format": "A4", "printBackground": true}' \
  --output converted.pdf
```

#### Convert URL
```bash
curl -X POST http://localhost/api/convert/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {"format": "A4", "printBackground": true}
  }' \
  --output converted.pdf
```

### JavaScript Examples

#### Convert HTML String
```javascript
const response = await fetch('http://localhost/api/convert/string', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: '<html><body><h1>Hello World</h1></body></html>',
    options: { format: 'A4', printBackground: true }
  })
});

const pdfBuffer = await response.arrayBuffer();
// Save or process the PDF buffer
```

#### Convert HTML File
```javascript
const formData = new FormData();
formData.append('htmlFile', htmlFile);
formData.append('options', JSON.stringify({ format: 'A4' }));

const response = await fetch('http://localhost/api/convert/file', {
  method: 'POST',
  body: formData
});

const pdfBuffer = await response.arrayBuffer();
```

## Configuration

### Environment Variables

- `PORT` - API server port (default: 3000)
- `NODE_ENV` - Environment (production/development)

### nginx Configuration

The nginx configuration includes:

- **Security Headers** - XSS protection, content type sniffing prevention
- **Rate Limiting** - 10 requests per second with burst allowance
- **File Upload Limits** - 50MB maximum file size
- **Timeout Settings** - Extended timeouts for PDF generation
- **Proxy Buffering** - Disabled for large responses

### Systemd Service

The API runs as a systemd service with:

- **Auto-restart** - Automatic restart on failure
- **Resource Limits** - File descriptor and process limits
- **Security** - Private temp, system protection
- **Logging** - Standard systemd logging

## Management Commands

### Service Management
```bash
# Check service status
sudo systemctl status html-to-pdf-api.service

# Restart API service
sudo systemctl restart html-to-pdf-api.service

# Restart nginx
sudo systemctl restart nginx

# View logs
sudo journalctl -u html-to-pdf-api.service -f
```

### nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo nginx -s reload

# Check nginx status
sudo systemctl status nginx
```

## Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   sudo journalctl -u html-to-pdf-api.service -n 50
   ```

2. **Permission denied**
   ```bash
   sudo chown -R www-data:www-data /home/svyat/dev/for_testing
   ```

3. **Port already in use**
   ```bash
   sudo netstat -tlnp | grep :3000
   sudo kill -9 [PID]
   ```

4. **nginx configuration error**
   ```bash
   sudo nginx -t
   sudo nginx -s reload
   ```

### Performance Tuning

1. **Increase memory limits**
   ```bash
   # Edit systemd service file
   sudo nano /etc/systemd/system/html-to-pdf-api.service
   # Add: LimitAS=2G
   ```

2. **Adjust nginx worker processes**
   ```bash
   # Edit nginx.conf
   sudo nano /etc/nginx/nginx.conf
   # Set: worker_processes auto;
   ```

## Security Considerations

- **Rate Limiting** - Prevents abuse and DoS attacks
- **File Size Limits** - Prevents memory exhaustion
- **Security Headers** - Protects against common web vulnerabilities
- **Input Validation** - Validates HTML files and URLs
- **Resource Limits** - Prevents resource exhaustion

## Monitoring

### Health Check
```bash
curl http://localhost/health
```

### Metrics (if needed)
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost/api/options

# Monitor system resources
htop
iotop
```

## Development

### Local Development
```bash
# Start in development mode
npm run dev

# Test the API
node test_api.js
```

### Adding New Features

1. **New Endpoint** - Add to `server.js`
2. **New Options** - Update `/api/options` endpoint
3. **New Formats** - Update puppeteer-html-pdf options

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review the logs: `sudo journalctl -u html-to-pdf-api.service`
- Test the health endpoint: `curl http://localhost/health` 