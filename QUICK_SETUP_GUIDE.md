# 🚀 QUICK SETUP GUIDE - Environment Variables

## ⚡ **FAST SETUP (Recommended)**

### **Option 1: Automated Setup Script**
```bash
# Run the automated setup script
./scripts/setup-env.sh
```

This script will:
- ✅ Create `.env.local` file automatically
- ✅ Generate secure JWT secrets
- ✅ Prompt for your configuration
- ✅ Set up Supabase secrets (if CLI is available)
- ✅ Add `.env.local` to `.gitignore`

### **Option 2: Manual Setup**
```bash
# Copy the template
cp env.template .env.local

# Edit the file with your values
nano .env.local
# or
code .env.local
```

## 🔑 **REQUIRED VARIABLES**

### **1. Gemini API Key (CRITICAL)**
```bash
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### **2. JWT Secret (CRITICAL)**
```bash
# Generate a secure random string
JWT_SECRET=your-super-secure-jwt-secret-here
```

### **3. Supabase Configuration (CRITICAL)**
```bash
# From your Supabase project settings
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

### **4. CORS Origins (SECURITY)**
```bash
# Your allowed domains
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## 🎯 **STEP-BY-STEP SETUP**

### **Step 1: Get Your Gemini API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### **Step 2: Get Your Supabase Keys**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL
   - anon/public key
   - service_role key

### **Step 3: Generate JWT Secret**
```bash
# Option 1: Use OpenSSL
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Use online generator
# https://generate-secret.vercel.app/32
```

### **Step 4: Create Environment File**
```bash
# Run the setup script
./scripts/setup-env.sh

# Or manually create .env.local
touch .env.local
```

### **Step 5: Add Your Values**
```bash
# Edit .env.local with your actual values
GEMINI_API_KEY=AIzaSy...your_actual_key
JWT_SECRET=your_generated_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=development
```

## 🔐 **SUPABASE SECRETS SETUP**

### **Install Supabase CLI (if not installed)**
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop install supabase

# Linux
curl -fsSL https://supabase.com/install.sh | sh
```

### **Set Secrets**
```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set GEMINI_API_KEY="your_key_here"
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com"
supabase secrets set JWT_SECRET="your_secret_here"
```

## ✅ **VERIFICATION**

### **Test Your Configuration**
```bash
# Run security tests
npm run security:test

# Check environment variables are loaded
node -e "
console.log('Environment check:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS ? '✅ Set' : '❌ Missing');
"
```

### **Test Supabase Connection**
```bash
# Check if your Supabase connection works
npm run dev
# Look for connection errors in the console
```

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "GEMINI_API_KEY not configured"**
```bash
# Check if .env.local exists
ls -la .env.local

# Check if variables are loaded
echo $GEMINI_API_KEY

# Restart your terminal/IDE after creating .env.local
```

### **Issue 2: "Supabase connection failed"**
```bash
# Verify your Supabase URL and keys
# Check if your project is active
# Ensure you're not hitting rate limits
```

### **Issue 3: "CORS errors"**
```bash
# Check ALLOWED_ORIGINS includes your domain
# Ensure no trailing slashes
# Restart your development server
```

## 🔒 **SECURITY CHECKLIST**

- [ ] `.env.local` created and configured
- [ ] `.env.local` added to `.gitignore`
- [ ] Gemini API key set correctly
- [ ] JWT secret generated securely
- [ ] Supabase keys configured
- [ ] CORS origins restricted
- [ ] Environment variables loaded
- [ ] Security tests passing
- [ ] Supabase secrets set (if using CLI)

## 🎉 **SUCCESS INDICATORS**

✅ **Environment setup complete when:**
- `npm run security:test` shows 93/100 or higher
- No "API key not configured" errors
- Supabase connection successful
- Application starts without environment errors
- All security features working

## 🚀 **NEXT STEPS AFTER SETUP**

1. **Deploy Secure Functions**
   ```bash
   cd supabase
   supabase functions deploy --verify-jwt
   ```

2. **Test Security**
   ```bash
   npm run security:test
   npm run security:audit
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Monitor for Issues**
   - Check console for errors
   - Verify API calls work
   - Test authentication flow

---

**Need Help?** Check the `SECURITY_DEPLOYMENT_GUIDE.md` for detailed instructions!
