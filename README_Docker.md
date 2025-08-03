# Docker Setup for HTML to PDF API

This document provides comprehensive instructions for running the HTML to PDF API using Docker and Docker Compose.

## 🐳 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### 1. Clone and Setup

```bash
git clone git@github.com:SvyatoSllav/DeepSeekExporToPDF.git
cd DeepSeekExporToPDF
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### 2. Run the Application

#### Development Mode (with hot reload)
```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

#### Production Mode
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### Testing Mode
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📁 Docker Files Structure

```
DeepSeekExporToPDF/
├── Dockerfile                    # Main application container
├── docker-compose.yml            # Base Docker Compose configuration
├── docker-compose.dev.yml        # Development configuration
├── docker-compose.prod.yml       # Production configuration
├── docker-compose.test.yml       # Testing configuration
├── docker-compose.override.yml   # Local development overrides
├── .dockerignore                 # Files to exclude from Docker build
├── scripts/
│   └── docker-setup.sh          # Docker environment setup script
└── monitoring/
    └── prometheus.yml           # Prometheus configuration
```

## 🏗️ Architecture

### Services

1. **API Server** (`api`)
   - Node.js application with Puppeteer
   - Handles HTML to PDF conversion
   - Runs on port 3000 internally

2. **Nginx Reverse Proxy** (`nginx`)
   - Load balancer and reverse proxy
   - Handles SSL termination
   - Rate limiting and security headers
   - Runs on port 80/443 externally

3. **Redis Cache** (`redis`)
   - Caching layer for improved performance
   - Session storage
   - Rate limiting data

4. **Monitoring Stack** (optional)
   - **Prometheus**: Metrics collection
   - **Grafana**: Metrics visualization

## 🚀 Deployment Options

### Development Environment

```bash
# Start with hot reloading
docker-compose -f docker-compose.yml -f docker-compose.override.yml up

# Access points:
# - API: http://localhost:3000
# - Nginx: http://localhost:8080
# - Redis: localhost:6379
```

### Production Environment

```bash
# Start in detached mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Access points:
# - API: http://localhost:3000
# - Nginx: http://localhost:80
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
```

### Testing Environment

```bash
# Run tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# View test results
docker-compose -f docker-compose.test.yml logs test
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Application environment |
| `PORT` | `3000` | API server port |
| `REDIS_URL` | `redis://redis:6379` | Redis connection URL |

### Volume Mounts

- `./uploads:/app/uploads` - File uploads directory
- `./ssl:/etc/nginx/ssl:ro` - SSL certificates
- `./nginx.conf:/etc/nginx/conf.d/default.conf:ro` - Nginx configuration

### Resource Limits (Production)

| Service | Memory | CPU |
|---------|--------|-----|
| API | 2GB | 1.0 cores |
| Nginx | 256MB | 0.5 cores |
| Redis | 512MB | 0.5 cores |

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose logs api
```

### Metrics

- **Prometheus**: Collects metrics from API and Nginx
- **Grafana**: Visualizes metrics with dashboards
- **Redis**: Monitors cache performance

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f nginx
docker-compose logs -f redis
```

## 🔒 Security

### Container Security

- Non-root user execution
- Read-only filesystem where possible
- Resource limits to prevent DoS
- Health checks for automatic recovery

### Network Security

- Isolated Docker networks
- Nginx rate limiting
- SSL/TLS termination
- Security headers

### Data Security

- Volume encryption (if enabled)
- Secure file permissions
- Temporary file cleanup

## 🛠️ Management Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart api

# View running containers
docker-compose ps

# View logs
docker-compose logs -f api
```

### Development

```bash
# Start with hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up

# Rebuild containers
docker-compose build --no-cache

# Execute commands in container
docker-compose exec api npm install
docker-compose exec api node test_api.js
```

### Production

```bash
# Deploy with monitoring
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale api=3

# Update services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Testing

```bash
# Run tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Run specific test
docker-compose -f docker-compose.test.yml run test node test_api.js
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the port
   sudo netstat -tlnp | grep :3000
   
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"
   ```

2. **Memory issues**
   ```bash
   # Check container memory usage
   docker stats
   
   # Increase memory limits
   deploy:
     resources:
       limits:
         memory: 4G
   ```

3. **SSL certificate issues**
   ```bash
   # Regenerate certificates
   ./scripts/docker-setup.sh
   ```

4. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs api
   
   # Rebuild container
   docker-compose build --no-cache api
   ```

### Debugging

```bash
# Enter container shell
docker-compose exec api sh

# Check container resources
docker stats

# Inspect container
docker inspect html-to-pdf-api

# View container processes
docker-compose exec api ps aux
```

## 📈 Performance Optimization

### Resource Tuning

```yaml
# Increase API memory for large PDFs
deploy:
  resources:
    limits:
      memory: 4G
      cpus: '2.0'
```

### Caching

```yaml
# Enable Redis caching
environment:
  - REDIS_URL=redis://redis:6379
```

### Load Balancing

```yaml
# Scale API instances
docker-compose up -d --scale api=3
```

## 🚀 Deployment Examples

### Local Development

```bash
# Quick start
./scripts/docker-setup.sh
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

### Production Server

```bash
# Full production deployment
./scripts/docker-setup.sh
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Monitor deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

### CI/CD Pipeline

```bash
# Build and test
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

**Happy containerizing! 🐳** 