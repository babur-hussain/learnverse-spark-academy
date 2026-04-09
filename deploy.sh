#!/bin/bash

# Configuration
EC2_USER="ec2-user"
EC2_IP="13.206.99.198"
PEM_KEY="backend/Key-2.pem"
REMOTE_DIR="~/learnverse-backend"

echo "==========================================="
echo "🚀 Deploying Learnverse Backend Server..."
echo "==========================================="

echo "1. Syncing files to EC2 server..."
# Sync the backend directory to EC2 (excludes node_modules and .git)
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'Key-2.pem' -e "ssh -o StrictHostKeyChecking=no -i $PEM_KEY" backend/ $EC2_USER@$EC2_IP:$REMOTE_DIR/

echo "2. Installing dependencies and restarting server..."
ssh -o StrictHostKeyChecking=no -i $PEM_KEY $EC2_USER@$EC2_IP << 'EOF'
  cd ~/learnverse-backend
  
  echo "=> Installing NPM dependencies..."
  npm install
  
  echo "=> Starting/Restarting server using PM2..."
  # Check if PM2 is already tracking the process
  pm2 describe learnverse-backend > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    pm2 restart learnverse-backend
  else
    pm2 start src/server.js --name "learnverse-backend"
    pm2 save
    # Setup pm2 to start on server boot
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
  fi
EOF

echo "==========================================="
echo "✅ Deployment Successful!"
echo "Your backend is running live at http://$EC2_IP"
echo "==========================================="
