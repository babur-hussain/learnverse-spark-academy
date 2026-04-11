#!/bin/bash
# ============================================================
# Nginx + SSL Setup Script for LearnVerse Backend
# Run this on your EC2 instance (Amazon Linux 2 / Ubuntu)
# Usage: sudo bash setup-nginx-ssl.sh
# ============================================================

set -e

DOMAIN="learnverse.lfvs.in"
BACKEND_PORT=5000
EMAIL="admin@lfvs.in"  # Change to your email for Let's Encrypt

echo "🔧 Setting up Nginx reverse proxy with SSL for $DOMAIN"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
fi

# ── Step 1: Install Nginx & Certbot ───────────────────────────
echo "📦 Installing Nginx and Certbot..."

if [[ "$OS" == "amzn" || "$OS" == "rhel" || "$OS" == "centos" ]]; then
    # Amazon Linux / RHEL / CentOS
    sudo yum install -y nginx
    sudo yum install -y certbot python3-certbot-nginx
elif [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
    # Ubuntu / Debian
    sudo apt update
    sudo apt install -y nginx certbot python3-certbot-nginx
else
    echo "⚠️  Unknown OS: $OS. Trying apt-based install..."
    sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
fi

# ── Step 2: Create Nginx Config ────────────────────────────────
echo "📝 Writing Nginx configuration..."

sudo tee /etc/nginx/conf.d/learnverse.conf > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Redirect HTTP to HTTPS (will be enabled after SSL is set up)
    # return 301 https://\$server_name\$request_uri;

    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Increase max body size for file uploads
        client_max_body_size 50M;
    }
}
EOF

# Remove default config if it conflicts
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test Nginx config
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start/Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# ── Step 3: Open Firewall Ports ────────────────────────────────
echo "🔓 Ensuring firewall allows ports 80 and 443..."

# iptables (if present)
if command -v iptables &> /dev/null; then
    sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
    sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
fi

# ── Step 4: Obtain SSL Certificate ────────────────────────────
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
echo ""
echo "⚠️  IMPORTANT: Make sure:"
echo "   1. Port 443 is open in your EC2 Security Group"
echo "   2. DNS for $DOMAIN points to this server's IP"
echo ""

sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# ── Step 5: Set up auto-renewal ────────────────────────────────
echo "⏰ Setting up SSL auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo tee -a /var/spool/cron/root 2>/dev/null || \
(echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo tee /etc/cron.d/certbot-renew)

# ── Step 6: Final Nginx restart ────────────────────────────────
sudo systemctl restart nginx

echo ""
echo "✅ Setup complete!"
echo ""
echo "Your server should now be accessible at:"
echo "  🔗 https://$DOMAIN"
echo ""
echo "Next steps:"
echo "  1. Make sure port 443 is open in your AWS EC2 Security Group"
echo "  2. Update your mobile app .env to use https://$DOMAIN"
echo "  3. Test: curl https://$DOMAIN/api/health"
echo ""
