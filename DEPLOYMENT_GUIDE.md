# Production Deployment Guide

## Pre-Deployment Checklist

### ✅ App Configuration
- [x] Updated package.json with correct app name and version
- [x] Configured capacitor.config.ts for production
- [x] Added proper security configurations
- [x] Optimized build settings in vite.config.ts
- [x] Added privacy policy and terms of service

### 🛡️ Security
- [x] Disabled cleartext traffic for Android
- [x] Added network security configuration
- [x] Configured data extraction rules
- [x] Removed development navigation allowlist
- [x] Disabled console logs in production build

### 📱 App Store Requirements
- [x] Created comprehensive app store descriptions
- [x] Added proper meta tags and app information
- [x] Set up privacy policy and terms routes
- [ ] Generate app icons for all required sizes
- [ ] Create splash screens for both platforms
- [ ] Configure proper app signing

## Build Commands

### Development Builds
```bash
# Android Debug
npm run build:android-debug

# iOS Debug  
npm run build:ios-debug
```

### Production Builds
```bash
# Android Release APK
npm run build:android-release

# Android App Bundle (for Play Store)
npm run build:android-bundle

# iOS Release Archive
npm run build:ios-release
```

## Android Deployment

### 1. App Signing Setup
```bash
# Generate upload key
keytool -genkey -v -keystore upload-key.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000

# Add to android/gradle.properties
echo "UPLOAD_STORE_FILE=upload-key.keystore" >> android/gradle.properties
echo "UPLOAD_KEY_ALIAS=upload" >> android/gradle.properties
echo "UPLOAD_STORE_PASSWORD=your_password" >> android/gradle.properties
echo "UPLOAD_KEY_PASSWORD=your_password" >> android/gradle.properties
```

### 2. Build Signed APK/Bundle
```bash
# Build signed bundle for Play Store
npm run build:android-bundle

# Build signed APK for testing
npm run build:android-release
```

### 3. Google Play Store Upload
1. Go to Google Play Console
2. Create new app listing
3. Upload Android App Bundle (.aab file)
4. Complete store listing with descriptions from APP_STORE_DESCRIPTION.md
5. Add screenshots and graphics
6. Submit for review

## iOS Deployment

### 1. Code Signing Setup
1. Open project in Xcode: `npm run cap:open:ios`
2. Select App target → Signing & Capabilities
3. Select your development team
4. Configure bundle identifier: `com.learnverse.sparkacademy`
5. Ensure "Automatically manage signing" is checked

### 2. Build Archive
```bash
# Build release archive
npm run build:ios-release
```

### 3. App Store Connect Upload
1. Open Xcode
2. Go to Window → Organizer
3. Select your archive
4. Click "Distribute App"
5. Select "App Store Connect"
6. Follow upload process

### 4. App Store Listing
1. Go to App Store Connect
2. Create new app listing
3. Use descriptions from APP_STORE_DESCRIPTION.md
4. Add screenshots and app preview videos
5. Submit for review

## Required Assets

### App Icons
Generate the following icon sizes:

**iOS:**
- 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

**Android:**
- 48x48 (mdpi), 72x72 (hdpi), 96x96 (xhdpi), 144x144 (xxhdpi), 192x192 (xxxhdpi), 512x512 (Play Store)

### Splash Screens
**iOS:**
- Various sizes for different devices (handled by Storyboard)

**Android:**
- 320x480, 480x800, 720x1280, 1080x1920, 1440x2560

### Screenshots
Take screenshots of:
1. Home/Dashboard screen
2. AI Chat interface
3. Study materials library
4. Progress tracking
5. Subject selection
6. Settings/Profile
7. Dark mode examples

## Environment Variables

Create production environment files:

### .env.production
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

## Testing Checklist

### Functionality Testing
- [ ] User authentication works
- [ ] All navigation routes accessible
- [ ] AI chat functionality
- [ ] File downloads work
- [ ] Offline mode functions
- [ ] Dark/light theme switching
- [ ] All forms submit correctly

### Performance Testing
- [ ] App launches quickly
- [ ] Smooth scrolling and transitions
- [ ] Memory usage is reasonable
- [ ] Battery usage is optimized
- [ ] Network requests are efficient

### Platform-Specific Testing
- [ ] iOS status bar handling
- [ ] Android back button behavior
- [ ] Keyboard interactions
- [ ] Touch gestures work properly
- [ ] Rotation support (if enabled)

## Post-Deployment

### Monitoring
- Set up crash reporting (Firebase Crashlytics recommended)
- Monitor app performance metrics
- Track user engagement and retention
- Monitor reviews and ratings

### Updates
- Increment version numbers for each release
- Follow semantic versioning (major.minor.patch)
- Test updates thoroughly before release
- Prepare release notes for each update

## Troubleshooting

### Common Issues
1. **Build Failures**: Clean project with `npm run clean`
2. **Signing Issues**: Verify certificates and provisioning profiles
3. **Store Rejection**: Review store guidelines and fix issues
4. **Performance**: Use production builds for testing

### Support Resources
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
