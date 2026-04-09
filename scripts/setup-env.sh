#!/bin/bash

# 🔒 LearnVerse Environment Setup Script
# This script helps you set up all necessary environment variables

set -e

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64
}

# Function to prompt for input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\${input:-$default}"
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

# Function to validate URL
validate_url() {
    local url="$1"
    if [[ $url =~ ^https?:// ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate email
validate_email() {
    local email="$1"
    if [[ $email =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Main setup function
main() {
    echo -e "${BLUE}"
    echo "🔒 LEARNVERSE ENVIRONMENT SETUP"
    echo "================================"
    echo -e "${NC}"
    
    print_status "Starting environment setup..."
    
    # Check if .env.local already exists
    if [ -f ".env.local" ]; then
        print_warning ".env.local already exists. Do you want to overwrite it? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_status "Setup cancelled. Using existing .env.local"
            return 0
        fi
    fi
    
    # Check required tools
    if ! command_exists openssl && ! command_exists base64; then
        print_warning "OpenSSL or base64 not found. Using fallback method for secret generation."
    fi
    
    # Create .env.local file
    print_status "Creating .env.local file..."
    
    cat > .env.local << EOF
# 🔒 LEARNVERSE SECURITY ENVIRONMENT VARIABLES
# Generated on $(date)
# ⚠️  NEVER commit this file to version control

# ============================================================================
# API KEYS & SECRETS
# ============================================================================

# Google Gemini API Key (REQUIRED)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# JWT Secret for authentication (REQUIRED)
JWT_SECRET=$(generate_secret)

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# Allowed CORS origins (comma-separated list)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Environment
NODE_ENV=development

# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================

# Supabase URL
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon Key
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# ============================================================================
# SECURITY FEATURES
# ============================================================================

# Enable virus scanning for file uploads
ENABLE_VIRUS_SCAN=false

# Security logging level
SECURITY_LOG_LEVEL=info

# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================================================
# COMPLIANCE & PRIVACY
# ============================================================================

# GDPR compliance
GDPR_ENABLED=true
DATA_RETENTION_DAYS=365

# Data encryption
ENCRYPTION_ENABLED=true
ENCRYPTION_ALGORITHM=aes-256-gcm

# ============================================================================
# DEVELOPMENT OVERRIDES
# ============================================================================

# Override security settings for development
DEV_MODE=true
SKIP_AUTH_VERIFICATION=false
SKIP_RATE_LIMITING=false
EOF
    
    print_success ".env.local file created successfully!"
    
    # Prompt for configuration
    echo
    print_status "Now let's configure your environment variables..."
    echo
    
    # Gemini API Key
    print_status "Setting up Gemini API Key..."
    prompt_with_default "Enter your Gemini API Key" "" "GEMINI_API_KEY"
    
    # JWT Secret
    print_status "Setting up JWT Secret..."
    prompt_with_default "Enter your JWT Secret (or press Enter to generate)" "$(generate_secret)" "JWT_SECRET"
    
    # Allowed Origins
    print_status "Setting up CORS Origins..."
    prompt_with_default "Enter allowed CORS origins (comma-separated)" "http://localhost:3000,http://localhost:8080" "ALLOWED_ORIGINS"
    
    # Supabase Configuration
    echo
    print_status "Setting up Supabase configuration..."
    
    # Supabase URL
    while true; do
        prompt_with_default "Enter your Supabase URL" "https://your-project-id.supabase.co" "SUPABASE_URL"
        if validate_url "$SUPABASE_URL"; then
            break
        else
            print_error "Invalid URL format. Please enter a valid HTTPS URL."
        fi
    done
    
    # Supabase Anon Key
    prompt_with_default "Enter your Supabase Anon Key" "your-supabase-anon-key-here" "SUPABASE_ANON_KEY"
    
    # Supabase Service Role Key
    prompt_with_default "Enter your Supabase Service Role Key" "your-supabase-service-role-key-here" "SUPABASE_SERVICE_ROLE_KEY"
    
    # Environment
    echo
    print_status "Setting up environment configuration..."
    prompt_with_default "Enter environment (development/production/test)" "development" "NODE_ENV"
    
    # Update .env.local with user input
    print_status "Updating .env.local with your configuration..."
    
    # Use sed to replace values in .env.local
    sed -i.bak "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=$GEMINI_API_KEY|" .env.local
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.local
    sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=$ALLOWED_ORIGINS|" .env.local
    sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" .env.local
    sed -i.bak "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env.local
    sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY|" .env.local
    sed -i.bak "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|" .env.local
    
    # Remove backup file
    rm -f .env.local.bak
    
    print_success "Environment variables configured successfully!"
    
    # Supabase secrets setup
    echo
    print_status "Setting up Supabase secrets..."
    
    if command_exists supabase; then
        print_status "Supabase CLI found. Setting up secrets..."
        
        # Set Supabase secrets
        supabase secrets set GEMINI_API_KEY="$GEMINI_API_KEY"
        supabase secrets set ALLOWED_ORIGINS="$ALLOWED_ORIGINS"
        supabase secrets set JWT_SECRET="$JWT_SECRET"
        
        print_success "Supabase secrets configured successfully!"
    else
        print_warning "Supabase CLI not found. Please install it and run the following commands manually:"
        echo
        echo "  supabase secrets set GEMINI_API_KEY=\"$GEMINI_API_KEY\""
        echo "  supabase secrets set ALLOWED_ORIGINS=\"$ALLOWED_ORIGINS\""
        echo "  supabase secrets set JWT_SECRET=\"$JWT_SECRET\""
        echo
    fi
    
    # Final steps
    echo
    print_status "Final configuration steps..."
    
    # Add .env.local to .gitignore if not already there
    if ! grep -q ".env.local" .gitignore 2>/dev/null; then
        echo ".env.local" >> .gitignore
        print_success "Added .env.local to .gitignore"
    fi
    
    # Create production environment file
    if [ "$NODE_ENV" = "production" ]; then
        print_status "Creating production environment file..."
        cp .env.local .env.production
        print_success "Production environment file created"
    fi
    
    # Summary
    echo
    print_success "🎉 Environment setup completed successfully!"
    echo
    echo "📋 Configuration Summary:"
    echo "  • Gemini API Key: ${GEMINI_API_KEY:0:20}..."
    echo "  • JWT Secret: ${JWT_SECRET:0:20}..."
    echo "  • CORS Origins: $ALLOWED_ORIGINS"
    echo "  • Supabase URL: $SUPABASE_URL"
    echo "  • Environment: $NODE_ENV"
    echo
    echo "🚀 Next steps:"
    echo "  1. Deploy your edge functions: supabase functions deploy --verify-jwt"
    echo "  2. Test your security: npm run security:test"
    echo "  3. Start your application: npm run dev"
    echo
    echo "⚠️  Security reminders:"
    echo "  • Never commit .env.local to version control"
    echo "  • Keep your API keys secure"
    echo "  • Use different keys for development and production"
    echo "  • Monitor API usage and costs"
    echo
}

# Run main function
main "$@"
