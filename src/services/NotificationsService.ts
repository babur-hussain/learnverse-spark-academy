import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

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
            await supabase.from('notification_devices').upsert({
              user_id: userId,
              token: token.value,
              platform: Capacitor.getPlatform(),
              enabled: true,
              last_seen_at: new Date().toISOString(),
            }, { onConflict: 'token' });
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
