import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Client from '../../api/client';
import { setFCMToken } from '../../actions/user';
import { store } from '../../index';

export async function registerFCMToken() {
  const { user } = store.getState();

  try {
    // Check user is logged in
    if (!user?.token) return;

    // Ensure device is registered for remote messages
    await messaging().registerDeviceForRemoteMessages();

    // Get the FCM token for this device
    const token = await messaging().getToken();
    if (!token) return;

    // If token unchanged, nothing to do
    if (user?.fcmToken === token) return;

    // Persist token in redux store
    store.dispatch(setFCMToken(token));

    // Save token to server
    await Client.registerFCMToken({
      device_token: token,
      device_type: Platform.OS === 'ios' ? 'ios' : 'android',
    });
  } catch (error) {
    console.log('registerFCMTokenError', error);
  }
}

export async function deleteFCMToken() {
  const { user } = store.getState();

  try {
    // Check user is logged in
    if (!user?.token) {
      throw new Error('User is null');
    }

    if (!user?.fcmToken) {
      throw new Error('FCMToken is null');
    }

    // Delete token locally on device
    await messaging().deleteToken();
    // Optional: unregister device for remote messages
    await messaging().unregisterDeviceForRemoteMessages();

    // Remove token from server
    await Client.deleteFCMToken({
      device_token: user?.fcmToken,
    });

    // Clear token in redux store
    store.dispatch(setFCMToken(null));
  } catch (error) {
    console.log('deleteFCMTokenError', error);
  }
}
