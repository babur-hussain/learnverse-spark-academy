import apiClient from '@/integrations/api/client';

export class NotificationsService {
  static async registerDeviceToken(userId: string | null) {
    // Mobile push notifications are handled by the separate mobile codebase (Expo)
    return;
  }
}
