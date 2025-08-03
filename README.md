# DeepSeek Export to PDF

A powerful HTML to PDF conversion API server with full style preservation, built with Node.js and served through nginx. Perfect for converting DeepSeek chat exports and other HTML content to high-quality PDFs.

## 🌟 Features

- ✅ **Full CSS Style Preservation** - All styles, colors, fonts, and layouts are preserved
- ✅ **JavaScript Rendering** - Dynamic content and JavaScript-heavy pages
- ✅ **Multiple Input Sources** - HTML strings, files, and URLs
- ✅ **Custom PDF Options** - Format, orientation, margins, scaling
- ✅ **Production Ready** - nginx reverse proxy with security headers
- ✅ **Rate Limiting** - Built-in protection against abuse
- ✅ **File Upload Support** - Multipart form data for HTML files
- ✅ **Health Monitoring** - Built-in health check endpoints

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- nginx (optional, for production)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:SvyatoSllav/DeepSeekExporToPDF.git
   cd DeepSeekExporToPDF
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the setup script (for production with nginx)**
   ```bash
   chmod +x setup_api.sh
   ./setup_api.sh
   ```

4. **Or start in development mode**
   ```bash
   npm run dev
   ```

5. **Test the API**
   ```bash
   node test_api.js
   ```

## 📖 API Documentation

### Health Check
```http
GET /health
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

### Get Available Options
```http
GET /api/options
```

## 💻 Usage Examples

### cURL Examples

#### Convert DeepSeek Chat Export
```bash
curl -X POST http://localhost/api/convert/file \
  -F "htmlFile=@deepseek-chat-2025-08-03T15-20-31.html" \
  -F 'options={"format": "A4", "printBackground": true}' \
  --output deepseek-chat.pdf
```

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

```javascript
// Convert HTML string
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

## 🔧 Configuration

### Environment Variables

- `PORT` - API server port (default: 3000)
- `NODE_ENV` - Environment (production/development)

### Production Setup

The project includes:

- **nginx configuration** - Reverse proxy with security headers
- **systemd service** - Automatic startup and restart
- **Rate limiting** - Protection against abuse
- **File upload limits** - 50MB maximum file size

## 📁 Project Structure

```
DeepSeekExporToPDF/
├── server.js                 # Main API server
├── package.json              # Node.js dependencies
├── nginx.conf               # nginx configuration
├── html-to-pdf-api.service  # systemd service file
├── setup_api.sh             # Automated setup script
├── test_api.js              # API test client
├── README.md                # This file
├── README_API.md            # Detailed API documentation
└── uploads/                 # Temporary file uploads
```

## 🛠️ Development

### Local Development
```bash
# Start in development mode
npm run dev

# Test the API
node test_api.js
```

### Adding Features

1. **New Endpoint** - Add to `server.js`
2. **New Options** - Update `/api/options` endpoint
3. **New Formats** - Update puppeteer-html-pdf options

## 🔒 Security

- **Rate Limiting** - 10 requests per second with burst allowance
- **File Size Limits** - 50MB maximum file size
- **Security Headers** - XSS protection, content type sniffing prevention
- **Input Validation** - Validates HTML files and URLs
- **Resource Limits** - Prevents resource exhaustion

## 📊 Monitoring

### Health Check
```bash
curl http://localhost/health
```

### Service Management
```bash
# Check service status
sudo systemctl status html-to-pdf-api.service

# View logs
sudo journalctl -u html-to-pdf-api.service -f

# Restart service
sudo systemctl restart html-to-pdf-api.service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Check the [troubleshooting section](README_API.md#troubleshooting)
- Review the logs: `sudo journalctl -u html-to-pdf-api.service -f`
- Test the health endpoint: `curl http://localhost/health`

## 🙏 Acknowledgments

- [puppeteer-html-pdf](https://www.npmjs.com/package/puppeteer-html-pdf) - For excellent HTML to PDF conversion
- [Express.js](https://expressjs.com/) - For the web framework
- [nginx](https://nginx.org/) - For the reverse proxy

---

**Made with ❤️ for DeepSeek chat exports** 