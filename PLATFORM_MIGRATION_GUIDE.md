# 🚀 Platform Migration Guide

## 📋 Overview

This guide helps you migrate from the current separate folder structure (`src/web/`, `src/app/`) to a single codebase with platform detection.

## 🎯 Why Change?

### Current Problems:
- ❌ Code duplication across folders
- ❌ Maintenance nightmare (update multiple places)
- ❌ Inconsistency between versions
- ❌ Bundle size issues
- ❌ Testing complexity

### New Benefits:
- ✅ Single source of truth
- ✅ Update once, works everywhere
- ✅ Consistent behavior
- ✅ Smaller bundle size
- ✅ Easier testing

## 🛠️ New Architecture

### 1. Platform Detection
```typescript
import { usePlatform, isPlatform } from '../contexts/PlatformContext';

const MyComponent = () => {
  const { platform, isPlatform } = usePlatform();
  
  if (isPlatform('web')) {
    // Web-specific logic
  }
  
  if (isPlatform('mobile')) {
    // Mobile-specific logic
  }
};
```

### 2. Conditional Rendering
```typescript
import { PlatformWrapper, WebOnly, MobileOnly } from '../components/Platform/PlatformWrapper';

const MyPage = () => {
  return (
    <div>
      <h1>Welcome</h1>
      
      <WebOnly>
        <WebSpecificComponent />
      </WebOnly>
      
      <MobileOnly>
        <MobileSpecificComponent />
      </MobileOnly>
      
      <PlatformWrapper platforms={['ios']}>
        <IOSOnlyFeature />
      </PlatformWrapper>
    </div>
  );
};
```

## 🔄 Migration Steps

### Step 1: Update App Root
```typescript
// src/App.tsx or main entry point
import { PlatformProvider } from './contexts/PlatformContext';

function App() {
  return (
    <PlatformProvider>
      {/* Your app content */}
    </PlatformProvider>
  );
}
```

### Step 2: Consolidate Components
Instead of having:
```
src/web/components/Auth/AuthDialog.tsx
src/app/components/Auth/AuthDialog.tsx
src/components/Auth/AuthDialog.tsx
```

Have one:
```
src/components/Auth/AuthDialog.tsx
```

### Step 3: Use Platform Detection
```typescript
// Before: Separate components
// src/web/components/Auth/AuthDialog.tsx
// src/app/components/Auth/AuthDialog.tsx

// After: Single component with platform detection
import { usePlatform } from '../../contexts/PlatformContext';

const AuthDialog = () => {
  const { isPlatform } = usePlatform();
  
  return (
    <div>
      {/* Common content */}
      
      {isPlatform('web') && (
        <WebSpecificFeatures />
      )}
      
      {isPlatform('mobile') && (
        <MobileSpecificFeatures />
      )}
    </div>
  );
};
```

### Step 4: Platform-Specific Styling
```typescript
import { usePlatform } from '../../contexts/PlatformContext';

const MyComponent = () => {
  const { platform } = usePlatform();
  
  const styles = {
    padding: platform.isMobile ? '16px' : '24px',
    fontSize: platform.isMobile ? '14px' : '16px',
  };
  
  return <div style={styles}>Content</div>;
};
```

## 📁 New Folder Structure

```
src/
├── components/           # All components (web + mobile)
│   ├── Auth/
│   ├── Layout/
│   └── Platform/        # Platform detection components
├── pages/               # All pages (web + mobile)
├── contexts/            # All contexts
├── hooks/               # All hooks
├── utils/               # All utilities
│   └── platform.ts      # Platform detection logic
└── styles/              # Platform-specific styles
    ├── web.css
    ├── mobile.css
    └── shared.css
```

## 🎨 Styling Strategy

### Option 1: CSS Classes
```css
/* styles/shared.css */
.component {
  /* Common styles */
}

/* styles/web.css */
.web .component {
  /* Web-specific styles */
}

/* styles/mobile.css */
.mobile .component {
  /* Mobile-specific styles */
}
```

### Option 2: CSS-in-JS
```typescript
import { usePlatform } from '../contexts/PlatformContext';

const useStyles = () => {
  const { platform } = usePlatform();
  
  return {
    container: {
      padding: platform.isMobile ? 16 : 24,
      fontSize: platform.isMobile ? 14 : 16,
    }
  };
};
```

### Option 3: Tailwind with Platform Classes
```typescript
const MyComponent = () => {
  const { platform } = usePlatform();
  
  return (
    <div className={`
      p-4 text-base
      ${platform.isMobile ? 'p-4 text-sm' : 'p-6 text-lg'}
    `}>
      Content
    </div>
  );
};
```

## 🔧 Advanced Usage

### Platform-Specific Hooks
```typescript
// hooks/usePlatformFeature.ts
import { usePlatform } from '../contexts/PlatformContext';

export const usePlatformFeature = () => {
  const { platform } = usePlatform();
  
  const features = {
    pushNotifications: platform.isMobile,
    localStorage: platform.isWeb,
    biometricAuth: platform.isMobile,
    camera: platform.isMobile,
  };
  
  return features;
};
```

### Platform-Specific Routes
```typescript
// routes.tsx
import { usePlatform } from '../contexts/PlatformContext';

const AppRoutes = () => {
  const { isPlatform } = usePlatform();
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      
      {isPlatform('web') && (
        <Route path="/web-only" element={<WebOnlyPage />} />
      )}
      
      {isPlatform('mobile') && (
        <Route path="/mobile-only" element={<MobileOnlyPage />} />
      )}
    </Routes>
  );
};
```

### Platform-Specific APIs
```typescript
// services/api.ts
import { usePlatform } from '../contexts/PlatformContext';

export const useApi = () => {
  const { platform } = usePlatform();
  
  const baseURL = platform.isWeb 
    ? 'https://api.web.com' 
    : 'https://api.mobile.com';
  
  const headers = {
    'Platform': platform.platform,
    'User-Agent': platform.isMobile ? 'Mobile' : 'Web',
  };
  
  return { baseURL, headers };
};
```

## 🚨 Migration Checklist

- [ ] Install platform detection utilities
- [ ] Update App root with PlatformProvider
- [ ] Consolidate duplicate components
- [ ] Replace folder-based imports with platform detection
- [ ] Update styling to use platform classes
- [ ] Test on both web and mobile
- [ ] Remove old folder structure
- [ ] Update build configuration

## 💡 Best Practices

1. **Start Small**: Migrate one component at a time
2. **Test Thoroughly**: Ensure both platforms work correctly
3. **Use Fallbacks**: Provide alternatives for unsupported features
4. **Document Changes**: Keep track of what's been migrated
5. **Performance**: Use lazy loading for platform-specific code

## 🎯 Example Migration

### Before (Separate Folders):
```typescript
// src/web/components/Auth/AuthDialog.tsx
const WebAuthDialog = () => <div>Web Auth</div>;

// src/app/components/Auth/AuthDialog.tsx  
const MobileAuthDialog = () => <div>Mobile Auth</div>;
```

### After (Single Component):
```typescript
// src/components/Auth/AuthDialog.tsx
import { usePlatform } from '../../contexts/PlatformContext';

const AuthDialog = () => {
  const { isPlatform } = usePlatform();
  
  return (
    <div>
      <h2>Authentication</h2>
      
      {isPlatform('web') ? (
        <WebAuthFeatures />
      ) : (
        <MobileAuthFeatures />
      )}
    </div>
  );
};
```

This approach gives you the best of both worlds: platform-specific features with a single, maintainable codebase! 🚀
