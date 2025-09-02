/**
 * @format
 */
import {AppRegistry, Text, TextInput} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import Animated from 'react-native-reanimated';
import App from './src';
import {name as appName} from './app.json';

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

Animated.addWhitelistedNativeProps({text: true});

if (Text.defaultProps == null) {
  Text.defaultProps = {};
}
Text.defaultProps.allowFontScaling = false;
if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
}
TextInput.defaultProps.allowFontScaling = false;

// Register background message handler to show notifications when app is in background/killed
try {
  // messaging() can throw if native Firebase isn't configured. Guard the call.
  const fbMessaging = typeof messaging === 'function' ? messaging() : null;
  if (fbMessaging && typeof fbMessaging.setBackgroundMessageHandler === 'function') {
    fbMessaging.setBackgroundMessageHandler(async remoteMessage => {
      try {
        if (!remoteMessage) return;

        await notifee.displayNotification({
          title: remoteMessage.notification?.title || remoteMessage?.data?.title,
          body: remoteMessage.notification?.body || remoteMessage?.data?.body,
          android: {
            channelId: 'default',
          },
        });

        try {
          notifee.incrementBadgeCount(1);
        } catch (e) {
          // ignore badge errors on devices that don't support it
        }
      } catch (e) {
        console.log('backgroundMessageHandler error', e);
      }
    });
  } else {
    console.log('Firebase messaging not available - skipping background message handler');
  }
} catch (e) {
  console.log('Failed to register Firebase background message handler', e);
}

// Background Event Listener
try {
  if (notifee && typeof notifee.onBackgroundEvent === 'function') {
    notifee.onBackgroundEvent(async ({type, detail}) => {
      const {notification, pressAction} = detail;

      if (type === EventType.ACTION_PRESS) {
        await notifee.cancelNotification(notification.id);

        try {
          notifee.decrementBadgeCount(1);
        } catch (e) {
          // ignore
        }
      }
    });
  } else {
    console.log('notifee.onBackgroundEvent not available - skipping');
  }
} catch (e) {
  console.log('Failed to register notifee background event listener', e);
}

AppRegistry.registerComponent(appName, () => App);
