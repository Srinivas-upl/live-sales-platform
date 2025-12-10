# Private Repository Setup Guide

This guide explains how to configure the deployment script for private Git repositories.

## Configuration Options

### 1. **Update deploy.sh Configuration**

Edit `deploy.sh` and update the `GIT_REPO_URL` variable with your preferred authentication method:

```bash
# Choose ONE of these options:

# Option 1: SSH (Recommended for private repos)
GIT_REPO_URL="git@github.com:yourusername/live-sales-platform.git"

# Option 2: HTTPS with Personal Access Token (PAT)
GIT_REPO_URL="https://yourusername:your-token@github.com/yourusername/live-sales-platform.git"

# Option 3: HTTPS with stored credentials
GIT_REPO_URL="https://github.com/yourusername/live-sales-platform.git"
```

## Authentication Methods

### **Method 1: SSH Authentication (Recommended)**

#### Step 1: Generate SSH Key on Deployment Server
```bash
# Generate new SSH key (use your email)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter to accept default location
# Enter passphrase (optional but recommended)

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519
```

#### Step 2: Add Public Key to GitHub
```bash
# Display public key
cat ~/.ssh/id_ed25519.pub

# Copy the output (starts with ssh-ed25519)
```

**On GitHub:**
1. Go to **Settings** → **SSH and GPG keys**
2. Click **New SSH key**
3. Paste your public key
4. Click **Add SSH key**

#### Step 3: Test SSH Connection
```bash
ssh -T git@github.com
# Should see: "Hi username! You've successfully authenticated..."
```

### **Method 2: Personal Access Token (PAT)**

#### Step 1: Generate PAT on GitHub
1. Go to **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token** → **Generate new token (classic)**
3. Set permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (optional, for GitHub Actions)
4. Generate token and **COPY IT** (you won't see it again)

#### Step 2: Use PAT in deploy.sh
```bash
GIT_REPO_URL="https://Srinivas-upl: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@github.com/Srinivas-upl/live-sales-platform.git"
```

### **Method 3: Git Credential Store**

#### Step 1: Configure Git to Store Credentials
```bash
# Configure git to store credentials
git config --global credential.helper store

# First time will prompt for credentials
git clone https://github.com/yourusername/live-sales-platform.git
# Enter username and password/PAT when prompted
```

## Deployment with Private Repository

### **Before First Deployment:**

1. **Update deploy.sh:**
   ```bash
   # Edit deploy.sh
   nano deploy.sh
   
   # Update GIT_REPO_URL to your private repo
   GIT_REPO_URL="git@github.com:yourusername/live-sales-platform.git"
   ```

2. **Set up authentication** (choose one method above)

3. **Test repository access:**
   ```bash
   # Test clone (dry run)
   git ls-remote $GIT_REPO_URL
   
   # Should show repository branches without errors
   ```

### **Troubleshooting**

#### **SSH Issues:**
```bash
# Check SSH configuration
ssh -vT git@github.com

# Fix permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

# Add to SSH config
echo "Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519" >> ~/.ssh/config
```

#### **HTTPS Authentication Issues:**
```bash
# Clear git credentials
git credential reject <<EOF
protocol=https
host=github.com
path=yourusername/live-sales-platform.git
EOF

# Try with verbose output
GIT_CURL_VERBOSE=1 git clone $GIT_REPO_URL
```

#### **Permission Denied Errors:**
- Ensure repository exists and you have access
- Check if repository is private (not public)
- Verify username/token has correct permissions
- For organizations: check team permissions

## Security Best Practices

### **For SSH:**
1. **Use strong passphrase** for SSH key
2. **Regularly rotate keys** (every 6-12 months)
3. **Use different keys** for different servers
4. **Disable password authentication** on server

### **For PAT:**
1. **Use fine-grained tokens** with minimal permissions
2. **Set expiration date** (30-90 days recommended)
3. **Store tokens securely** (not in plain text)
4. **Rotate tokens regularly**

### **General Security:**
1. **Use .gitignore** for sensitive files
2. **Never commit** `.env` files or credentials
3. **Use environment variables** for secrets
4. **Regular security audits** of deployment server

## Automated Deployment with CI/CD

### **GitHub Actions Example:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.DEPLOY_TOKEN }}
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/live-sales-platform
            git pull origin main
            docker-compose -f docker-compose.prod.yml up -d --build
```

### **Environment Variables for CI/CD:**
```bash
# Set these in your CI/CD platform
DEPLOY_TOKEN=your-github-pat
SERVER_HOST=your-server-ip
SERVER_USER=deploy-user
SSH_PRIVATE_KEY=$(cat ~/.ssh/id_ed25519)
```

## Monitoring and Maintenance

### **Regular Checks:**
1. **SSH key expiration** (if using time-limited keys)
2. **PAT expiration** dates
3. **Repository access** permissions
4. **Deployment logs** for authentication errors

### **Update Procedures:**
```bash
# Update deployment script
cd /opt/live-sales-platform
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Support

### **Common Issues and Solutions:**

#### **Issue: "Repository not found"**
- Check repository URL is correct
- Verify repository exists and is not archived
- Confirm you have access to the repository

#### **Issue: "Permission denied (publickey)"**
- SSH key not added to GitHub
- Wrong SSH key being used
- SSH agent not running

#### **Issue: "Authentication failed"**
- PAT expired or revoked
- Incorrect username/token
- Network restrictions blocking GitHub

#### **Issue: "Could not read from remote repository"**
- Repository is private and no authentication
- Network/firewall issues
- GitHub API rate limiting

### **Getting Help:**
1. Check deployment logs: `./deploy.sh 2>&1 | tee deploy.log`
2. Test git access manually: `git ls-remote $GIT_REPO_URL`
3. Verify network connectivity: `curl -I https://github.com`
4. Check system time: Incorrect time can cause SSL issues

## Next Steps

After configuring private repository access:

1. **Test deployment** in staging environment
2. **Monitor first deployment** for any issues
3. **Set up backups** for database and uploads
4. **Configure monitoring** and alerts
5. **Document deployment process** for your team

Remember to keep your authentication credentials secure and rotate them regularly for security best practices.
