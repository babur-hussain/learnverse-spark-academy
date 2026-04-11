import { Capacitor } from '@capacitor/core';
import apiClient from '@/integrations/api/client';

export class NotificationsService {
  static async registerDeviceToken(userId: string | null) {
    if (!Capacitor.isNativePlatform()) return; // only on app

    // Disable Android push registration until Firebase (google-services.json) is configured
    if (Capacitor.getPlatform() === 'android') {
      return;
    }

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive !== 'granted') {
        const req = await PushNotifications.requestPermissions();
        if (req.receive !== 'granted') return;
      }

      await PushNotifications.register();

      return new Promise<void>((resolve) => {
        const tokenListener = PushNotifications.addListener('registration', async (token) => {
          try {
            await apiClient.post('/api/notifications/register-device', {
              user_id: userId,
              token: token.value,
              platform: Capacitor.getPlatform(),
              enabled: true,
            });
          } finally {
            tokenListener.remove();
            resolve();
          }
        });
      });
    } catch {
      // Ignore if push plugin fails (e.g., missing Firebase config)
      return;
    }
  }
}
