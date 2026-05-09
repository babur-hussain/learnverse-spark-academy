import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';

export interface PushNotificationState {
  deviceToken?: string;
  expoPushToken?: string;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [deviceToken, setDeviceToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(tokens => {
      if (tokens?.expoPushToken) setExpoPushToken(tokens.expoPushToken);
      if (tokens?.deviceToken) {
        setDeviceToken(tokens.deviceToken);
        // Send device token to backend if logged in
        if (auth.currentUser) {
          api.post('/notifications/register-device', {
            user_id: auth.currentUser.uid,
            token: tokens.deviceToken,
            platform: Platform.OS,
            enabled: true,
          }).catch(err => console.error('Failed to register device token:', err));
        }
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, deviceToken, notification };
};

async function registerForPushNotificationsAsync() {
  let expoPushToken;
  let deviceToken;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return undefined;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
      try {
        expoPushToken = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
      } catch (e) {
        console.log('Could not get Expo Push Token', e);
      }
      
      try {
        deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
      } catch (e) {
        console.log('Could not get Device Push Token. Expo Go does not support FCM directly.', e);
        // Fallback to use expo token as device token for testing if native fails
        if (expoPushToken && !deviceToken) {
          deviceToken = expoPushToken;
        }
      }
      
      console.log('Expo Push Token:', expoPushToken);
      console.log('Device Push Token:', deviceToken);
    } catch (e) {
      console.error('Error getting push tokens:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return { expoPushToken, deviceToken };
}
