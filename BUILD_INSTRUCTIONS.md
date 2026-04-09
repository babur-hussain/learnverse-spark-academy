# LearnVerse Build Instructions

## Overview
LearnVerse has two separate builds:
- **Web Version**: Browser-based application
- **App Version**: Mobile app (iOS/Android) using Capacitor

## Development

### Web Version (Browser)
```bash
npm run dev:web
```
- Runs on `http://localhost:8080`
- Uses components from `src/web/`
- Imports from `@web/*` aliases
- Root component: `WebRoot.tsx`

### App Version (Mobile)
```bash
npm run dev:app
```
- Runs on `http://localhost:8080`
- Uses components from `src/app/`
- Imports from `@app/*` aliases
- Root component: `AppRoot.tsx`

## Building

### Web Version
```bash
npm run build:web
```
- Builds to `dist/` directory
- Optimized for web browsers

### App Version
```bash
npm run build:app
```
- Builds to `dist/` directory
- Optimized for mobile devices
- Syncs with Capacitor: `npx cap sync`

## Important Notes

⚠️ **Never run `npm run dev` without specifying target** - this will cause conflicts!

✅ **Always use explicit target**: `npm run dev:web` or `npm run dev:app`

🔧 **Environment Variables**:
- `VITE_TARGET=web` → Web version
- `VITE_TARGET=app` → App version

📱 **Capacitor Commands** (for app version):
```bash
npx cap open ios      # Open iOS project
npx cap open android  # Open Android project
npx cap run android   # Run on Android device/emulator
npx cap run ios       # Run on iOS device/simulator
```

## File Structure
```
src/
├── web/          # Web-specific components
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── contexts/
├── app/          # App-specific components
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── contexts/
└── shared/       # Shared utilities (if any)
```

## Troubleshooting

### Web version not showing expected content?
1. Ensure you're running `npm run dev:web`
2. Check console for build target confirmation
3. Verify imports use `@web/*` aliases

### App version not working?
1. Ensure you're running `npm run dev:app`
2. Check console for build target confirmation
3. Verify imports use `@app/*` aliases

### Build conflicts?
1. Clear `dist/` directory
2. Restart development server
3. Check `VITE_TARGET` environment variable

