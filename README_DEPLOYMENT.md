# Live Sales Platform Deployment

## Deployment Options

The Live Sales Platform can be deployed in two ways:

### 1. **Without a Domain (Localhost/HTTP)**
- Uses HTTP only (no SSL)
- Accessible via server IP address
- Perfect for testing and development
- No domain configuration required

### 2. **With a Domain (HTTPS)**
- Uses HTTPS with SSL certificates
- Professional deployment with security
- Requires domain name and DNS configuration
- Includes automatic SSL certificate renewal

## Quick Start

### For Localhost/HTTP Deployment (No Domain):

1. **Update the deploy.sh script** (optional - already configured for localhost):
   ```bash
   # Default configuration works for localhost
   DOMAIN="yourdomain.com"  # Leave as default for localhost
   ```

2. **Run the deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Access the application**:
   - Application: `http://YOUR_SERVER_IP`
   - Backend API: `http://YOUR_SERVER_IP/api`
   - Frontend: `http://YOUR_SERVER_IP`

### For Domain/HTTPS Deployment:

1. **Update the deploy.sh script**:
   ```bash
   # Edit deploy.sh and change these variables:
   DOMAIN="your-actual-domain.com"
   EMAIL="your-email@domain.com"
   ```

2. **Configure DNS**:
   - Point your domain to your server's IP address
   - Add both `yourdomain.com` and `www.yourdomain.com`

3. **Run the deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Access the application**:
   - Application: `https://yourdomain.com`
   - Backend API: `https://yourdomain.com/api`
   - Frontend: `https://yourdomain.com`

## Deployment Script Features

The `deploy.sh` script automatically handles:

### For Both Deployments:
- ✅ System updates and Docker installation
- ✅ Application directory setup
- ✅ Environment variable configuration
- ✅ Docker image building
- ✅ Service orchestration with Docker Compose
- ✅ Automated backups
- ✅ Firewall configuration
- ✅ Nginx reverse proxy setup

### For Domain/HTTPS Deployment Only:
- ✅ SSL certificate installation (Let's Encrypt)
- ✅ Automatic certificate renewal
- ✅ HTTP to HTTPS redirect
- ✅ Security headers configuration
- ✅ Rate limiting for API endpoints

### For Localhost/HTTP Deployment:
- ✅ Simplified Nginx configuration
- ✅ HTTP-only access
- ✅ Server IP-based access
- ✅ Easy migration to HTTPS later

## Switching Between Modes

### From Localhost to Domain:
1. Update `DOMAIN` variable in `deploy.sh`
2. Configure DNS for your domain
3. Re-run `./deploy.sh`
4. The script will automatically:
   - Setup SSL certificates
   - Update Nginx configuration
   - Configure HTTPS

### From Domain to Localhost:
1. Set `DOMAIN="yourdomain.com"` in `deploy.sh`
2. Re-run `./deploy.sh`
3. The script will:
   - Skip SSL setup
   - Use HTTP-only configuration
   - Update URLs to use server IP

## Management Commands

After deployment, use these commands:

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run backup manually
./backup.sh

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

## Backup System

The deployment includes an automated backup system:
- **Daily backups** at 2:00 AM
- **Backup retention**: 7 days for database/uploads, 30 days for logs
- **Backup location**: `/opt/live-sales-platform/backups/`
- **Manual backup**: Run `./backup.sh`

Backups include:
- Database (`lspd.db`)
- Uploaded files (`uploads/` directory)
- Environment configuration (`.env` file)

## Security Features

### For Domain/HTTPS Deployment:
- **SSL/TLS encryption** with Let's Encrypt
- **HTTP to HTTPS redirect** enforced
- **Security headers** (CSP, X-Frame-Options, X-XSS-Protection)
- **Rate limiting** for API endpoints (10 requests/second)
- **Firewall rules** (SSH, HTTP, HTTPS only)

### For Localhost/HTTP Deployment:
- **Firewall rules** (SSH, HTTP only)
- **Security headers** (X-Frame-Options, X-XSS-Protection)
- **Rate limiting** for API endpoints

## Troubleshooting

### Common Issues:

1. **Port 80/443 already in use**:
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   # Stop conflicting services if needed
   ```

2. **Docker permission issues**:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **SSL certificate errors**:
   - Ensure DNS is properly configured
   - Check firewall allows port 80/443
   - Verify domain points to correct IP

4. **Application not accessible**:
   ```bash
   # Check service status
   docker-compose -f docker-compose.prod.yml ps
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs
   ```

## Migration Guide

### From Development to Production:
1. Test with localhost deployment first
2. Once verified, update to domain deployment
3. The same `deploy.sh` script works for both

### From Other Hosting:
1. Export your database if applicable
2. Follow the deployment instructions
3. Import data if needed
4. Update DNS records

## Support

For issues or questions:
1. Check the `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review the `QUICK_START_EC2.md` for AWS EC2 specific guidance
3. Check service logs: `docker-compose -f docker-compose.prod.yml logs -f`

## Notes

- The deployment script is idempotent - can be run multiple times safely
- Backups are automated but verify they're working
- Monitor disk space for uploads and backups
- Consider setting up monitoring for production deployments
