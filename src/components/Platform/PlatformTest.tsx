import React from 'react';
import { usePlatform } from '../../contexts/PlatformContext';
import { PlatformWrapper, WebOnly, MobileOnly, IOSOnly, AndroidOnly } from './PlatformWrapper';

/**
 * PlatformTest - A simple component to test platform detection
 * This will help verify that our platform detection is working correctly
 */
const PlatformTest = () => {
  const { platform, isPlatform } = usePlatform();

  return (
    <div className="p-6 bg-gray-50 rounded-lg border">
      <h2 className="text-xl font-bold mb-4">Platform Detection Test</h2>
      
      {/* Current Platform Info */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Current Platform:</h3>
        <div className="space-y-1 text-sm">
          <div><strong>Platform:</strong> {platform.platform}</div>
          <div><strong>Is Web:</strong> {platform.isWeb ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Is Mobile:</strong> {platform.isMobile ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Is iOS:</strong> {platform.isIOS ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Is Android:</strong> {platform.isAndroid ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Is Capacitor:</strong> {platform.isCapacitor ? '✅ Yes' : '❌ No'}</div>
        </div>
      </div>

      {/* Platform-Specific Features */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Platform-Specific Features:</h3>
        <div className="space-y-2">
          <div><strong>Push Notifications:</strong> {platform.features?.pushNotifications ? '✅ Available' : '❌ Not Available'}</div>
          <div><strong>Biometric Auth:</strong> {platform.features?.biometricAuth ? '✅ Available' : '❌ Not Available'}</div>
          <div><strong>Camera:</strong> {platform.features?.camera ? '✅ Available' : '❌ Not Available'}</div>
          <div><strong>Local Storage:</strong> {platform.features?.localStorage ? '✅ Available' : '❌ Not Available'}</div>
          <div><strong>Face ID:</strong> {platform.features?.faceID ? '✅ Available' : '❌ Not Available'}</div>
          <div><strong>Fingerprint:</strong> {platform.features?.fingerprint ? '✅ Available' : '❌ Not Available'}</div>
        </div>
      </div>

      {/* Conditional Rendering Test */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Conditional Rendering Test:</h3>
        
        <WebOnly>
          <div className="p-3 bg-blue-100 border border-blue-300 rounded text-blue-800">
            🖥️ This content is only visible on Web
          </div>
        </WebOnly>

        <MobileOnly>
          <div className="p-3 bg-green-100 border border-green-300 rounded text-green-800">
            📱 This content is only visible on Mobile
          </div>
        </MobileOnly>

        <IOSOnly>
          <div className="p-3 bg-purple-100 border border-purple-300 rounded text-purple-800">
            🍎 This content is only visible on iOS
          </div>
        </IOSOnly>

        <AndroidOnly>
          <div className="p-3 bg-orange-100 border border-orange-300 rounded text-orange-800">
            🤖 This content is only visible on Android
          </div>
        </AndroidOnly>

        <PlatformWrapper platforms={['web', 'ios']}>
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
            🌟 This content is visible on Web and iOS only
          </div>
        </PlatformWrapper>
      </div>

      {/* Platform Detection Functions Test */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Platform Detection Functions:</h3>
        <div className="space-y-2 text-sm">
          <div><strong>isPlatform('web'):</strong> {isPlatform('web') ? '✅ True' : '❌ False'}</div>
          <div><strong>isPlatform('mobile'):</strong> {isPlatform('mobile') ? '✅ True' : '❌ False'}</div>
          <div><strong>isPlatform('ios'):</strong> {isPlatform('ios') ? '✅ True' : '❌ False'}</div>
          <div><strong>isPlatform('android'):</strong> {isPlatform('android') ? '✅ True' : '❌ False'}</div>
          <div><strong>isPlatform('web', 'ios'):</strong> {isPlatform('web', 'ios') ? '✅ True' : '❌ False'}</div>
        </div>
      </div>

      {/* Responsive Design Test */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Responsive Design Test:</h3>
        <div className={`p-4 rounded ${
          platform.isMobile 
            ? 'bg-green-100 border-green-300 text-green-800' 
            : 'bg-blue-100 border-blue-300 text-blue-800'
        } border`}>
          <div className="font-medium">
            {platform.isMobile ? '📱 Mobile Layout' : '🖥️ Web Layout'}
          </div>
          <div className="text-sm mt-1">
            {platform.isMobile 
              ? 'This uses mobile-optimized spacing and sizing' 
              : 'This uses web-optimized spacing and sizing'
            }
          </div>
        </div>
      </div>

      {/* Feature Availability Test */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Feature Availability Test:</h3>
        <div className="space-y-2">
          {platform.features?.pushNotifications && (
            <div className="p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
              🔔 Push notifications are available on this platform
            </div>
          )}
          
          {platform.features?.biometricAuth && (
            <div className="p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
              🔐 Biometric authentication is available on this platform
            </div>
          )}
          
          {platform.features?.camera && (
            <div className="p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
              📷 Camera access is available on this platform
            </div>
          )}
          
          {platform.features?.localStorage && (
            <div className="p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
              💾 Local storage is available on this platform
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-gray-100 rounded border">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <pre className="text-xs bg-white p-2 rounded border overflow-auto">
          {JSON.stringify(platform, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default PlatformTest;
