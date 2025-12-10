# Quick Start: AWS EC2 Deployment

## 🚀 One-Click Deployment (Simplified)

### Step 1: Launch EC2 Instance
1. **AWS Console** → EC2 → Launch Instance
2. **AMI**: Ubuntu 22.04 LTS
3. **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
4. **Key Pair**: Create new or use existing
5. **Security Group**:
   - SSH (22) - Your IP only
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
6. **Launch Instance**

### Step 2: Connect to EC2
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y
```

### Step 3: Deploy Application
```bash
# Clone the repository
git clone https://github.com/yourusername/live-sales-platform.git
cd live-sales-platform

# Make deployment script executable
chmod +x deploy.sh

# Run deployment (update domain first)
# Edit deploy.sh and change DOMAIN="yourdomain.com" to your actual domain
nano deploy.sh

# Run deployment
./deploy.sh
```

### Step 4: Configure Domain & SSL
1. **Route 53** (or your DNS provider):
   - Create A record: `yourdomain.com` → EC2 Public IP
   - Create CNAME: `www.yourdomain.com` → `yourdomain.com`

2. **SSL Certificate** (auto-configured by deploy.sh):
   - Certbot will request SSL certificate
   - Auto-renewal configured

## 🔒 Essential Security Configuration

### 1. Update SSH Security
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change these settings:
PermitRootLogin no
PasswordAuthentication no
# Port 2222 (optional - change SSH port)

# Restart SSH
sudo systemctl restart sshd
```

### 2. Configure Firewall (UFW)
```bash
# Already configured by deploy.sh, but verify:
sudo ufw status
# Should show: 22, 80, 443 allowed
```

### 3. Update Application Security
```bash
# Generate strong JWT secret
cd /opt/live-sales-platform
openssl rand -base64 32 > .jwt_secret

# Update .env file
nano .env
# Set: JWT_SECRET=$(cat .jwt_secret)
```

## 📦 Docker Management Commands

### Start/Stop Services
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View logs
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs backend
```

### Monitor Resources
```bash
# View running containers
docker ps

# View resource usage
docker stats

# View container logs
docker logs live-sales-backend
docker logs live-sales-frontend
docker logs nginx-proxy
```

## 🔄 Backup & Restore

### Manual Backup
```bash
cd /opt/live-sales-platform
./backup.sh
```

### Restore from Backup
```bash
cd /opt/live-sales-platform/backups

# Find latest backup
ls -lt *.db | head -1

# Restore database
cp latest_backup.db ../lspd.db

# Restart services
docker-compose -f docker-compose.prod.yml restart backend
```

## 🚨 Troubleshooting

### Application Not Accessible
```bash
# Check if services are running
docker-compose -f docker-compose.prod.yml ps

# Check Nginx logs
docker logs nginx-proxy

# Check backend health
curl http://localhost:3001/

# Check firewall
sudo ufw status
```

### SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate expiry
sudo certbot certificates

# Restart Nginx
docker-compose -f docker-compose.prod.yml restart nginx-proxy
```

### Database Issues
```bash
# Check database file
ls -la /opt/live-sales-platform/lspd.db

# Check database size
du -sh /opt/live-sales-platform/lspd.db

# Backup before any operations
cp lspd.db lspd.db.backup
```

## 📈 Scaling & Monitoring

### Monitor Performance
```bash
# Install htop for system monitoring
sudo apt install -y htop
htop

# Check disk space
df -h

# Check memory usage
free -h
```

### Scale Up (Vertical Scaling)
1. **Stop instance** in AWS Console
2. **Change instance type** (t3.medium → t3.large)
3. **Start instance**
4. **Restart services**:
   ```bash
   cd /opt/live-sales-platform
   docker-compose -f docker-compose.prod.yml restart
   ```

## 🎯 Production Checklist

### Before Going Live
- [ ] Update `DOMAIN` in `deploy.sh`
- [ ] Configure DNS records
- [ ] Test SSL certificate
- [ ] Update JWT_SECRET in `.env`
- [ ] Configure backup schedule
- [ ] Set up monitoring alerts
- [ ] Test backup restoration
- [ ] Configure firewall rules
- [ ] Update SSH security settings

### Daily Maintenance
- [ ] Check application logs
- [ ] Verify backups completed
- [ ] Monitor disk space
- [ ] Review security alerts

### Weekly Maintenance
- [ ] Update system packages
- [ ] Update Docker images
- [ ] Review access logs
- [ ] Test SSL renewal

## 📞 Support

### Common Issues & Solutions

1. **"Connection refused" error**
   ```bash
   # Check if services are running
   docker-compose -f docker-compose.prod.yml ps
   
   # Check port 80/443 is open
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **SSL certificate expired**
   ```bash
   # Renew certificate
   sudo certbot renew --force-renewal
   
   # Restart Nginx
   docker restart nginx-proxy
   ```

3. **High memory usage**
   ```bash
   # Check memory usage
   docker stats
   
   # Restart services
   docker-compose -f docker-compose.prod.yml restart
   ```

4. **Database corruption**
   ```bash
   # Restore from backup
   cd /opt/live-sales-platform/backups
   cp $(ls -t *.db | head -1) ../lspd.db
   docker-compose -f docker-compose.prod.yml restart backend
   ```

### Getting Help
- Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Review deployment guide: `DEPLOYMENT_GUIDE.md`
- Check system status: `htop`, `df -h`, `free -h`

## 🏁 Next Steps After Deployment

1. **Test the application** at `https://yourdomain.com`
2. **Create merchant account** and test all features
3. **Configure email notifications** (if needed)
4. **Set up monitoring** with CloudWatch
5. **Configure CDN** for static assets
6. **Implement WAF** for additional security
7. **Set up CI/CD pipeline** for updates

## 📝 Notes

- **Default credentials**: First merchant needs to register
- **Data persistence**: Database stored in `/opt/live-sales-platform/lspd.db`
- **Uploads**: Stored in `/opt/live-sales-platform/uploads`
- **Backups**: Automatic daily backups to `/opt/live-sales-platform/backups`
- **Logs**: Docker logs available via `docker-compose logs`

## 🔗 Useful Links

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Live Sales Platform GitHub](https://github.com/yourusername/live-sales-platform)

---
**Remember**: Always test in staging environment before production deployment!
