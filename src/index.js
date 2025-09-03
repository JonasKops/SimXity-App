import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {Platform, StatusBar, DeviceEventEmitter, AppState} from 'react-native';
import {PersistGate} from 'redux-persist/integration/react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import codePush from 'react-native-code-push';
import notifee, {EventType, AuthorizationStatus} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import './config/translations';
import RootScreen from './screens/root';
import configStore from './store/index';
import {setToken} from './api/config';
import {Client} from './api';
import {saveStatusNetwork} from './actions/network';
import {saveNotifications} from './actions/notifications';
import DEEP_LINKING from './navigations/deeplinking';
import {CODE_PUSH} from './config';
import {navigationRef, navigate} from './navigations/navigations';
import NotificationModal from './component/common/notification-modal';
import { registerFCMToken } from './common';
import { checkCertificatesAndNotify } from './common/util/certificateNotifications';

const {store, persistor} = configStore();

export {store};

const MyApp = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    (async function () {
      try {
        await codePush.sync({
          deploymentKey:
            Platform.OS === 'ios' ? CODE_PUSH.ios : CODE_PUSH.android,
          installMode: codePush.InstallMode.IMMEDIATE,
        });
        setTimeout(() => {
          SplashScreen.hide();
        }, 1000);
      } catch (e) {
        console.log(e);
      }

      await onNotification();

      // Run certificate check once at startup (if user logged in)
      try {
        await checkCertificatesAndNotify(store);
      } catch (e) {
        console.log(e);
      }
    })();

    // Create Android notification channel for notifee
    (async () => {
      try {
        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'default',
            name: 'Default',
            importance: 4, // HIGH
          });
        }
      } catch (e) {
        console.log(e);
      }
    })();

    // Foreground message handler (show notification when app is in foreground)
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      try {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || remoteMessage?.data?.title,
          body: remoteMessage.notification?.body || remoteMessage?.data?.body,
          android: { channelId: 'default' },
        });

        try {
          notifee.incrementBadgeCount(1);
        } catch (e) {}
      } catch (e) {
        console.log(e);
      }
    });

    // Listen for app state changes and trigger certificate check when app becomes active
    const appStateListener = AppState.addEventListener?.('change', async nextState => {
      if (nextState === 'active') {
        try {
          await checkCertificatesAndNotify(store);
        } catch (e) {
          console.log(e);
        }
      }
    }) || null;

    return () => {
      // cleanup
      unsubscribeOnMessage && unsubscribeOnMessage();
      if (appStateListener && appStateListener.remove) appStateListener.remove();
    };
  }, []);

  async function onNotification() {
    // Request permissions (required for iOS)
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      setIsVisible(true);
    }

    notifee.onForegroundEvent(({type}) => {
      switch (type) {
        case EventType.PRESS:
          navigate('NotificationsScreen');
          break;
      }
    });

    if (!isVisible) {
      fetchNotifications();

      DeviceEventEmitter.addListener('notificationReceived', async () => {
        await fetchNotifications();
        // also check certificates when a notification event occurs (login, register, etc.)
        try {
          await checkCertificatesAndNotify(store);
        } catch (e) {
          console.log(e);
        }
      });
    }
  }

  async function fetchNotifications() {
    const {user} = store.getState();

    if (user?.token) {
      setToken(user?.token);

      try {
        const response = await Client.getNotifications({
          per_page: 20,
          page: 1,
        });

        if (response?.success) {
          const serverNotifs = response?.data?.notifications || [];
          const currentNotifs = store.getState().notifications?.list || [];
          if (currentNotifs.length === 0) {
            // no local notifications -> use server results
            await store.dispatch(saveNotifications(serverNotifs));
          } else if (serverNotifs.length > 0) {
            // merge server with existing, preferring server at top
            const merged = serverNotifs.concat(currentNotifs);
            await store.dispatch(saveNotifications(merged));
          } else {
            // server returned empty and we have local notifications; keep local and do not overwrite
            // keep existing local notifications when server returns empty
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  const onBeforeLift = async () => {
    NetInfo.addEventListener(async state => {
      try {
        await store.dispatch(saveStatusNetwork(state.isConnected));
      } catch (e) {
        console.log(e);
      }
    });

    const {user} = store.getState();

    if (user?.token) {
      setToken(user?.token);

      // For Android, register FCM token and listen for token refresh
      if (Platform.OS === 'android') {
        try {
          await registerFCMToken();
        } catch (e) {
          console.log(e);
        }

        // Re-register when FCM token is refreshed
        try {
          messaging().onTokenRefresh(async () => {
            try {
              await registerFCMToken();
            } catch (err) {
              console.log(err);
            }
          });
        } catch (e) {
          console.log(e);
        }
      }

      // run certificate check once when app finishes rehydration and user is present
      try {
        await checkCertificatesAndNotify(store);
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <Provider store={store}>
      <PersistGate
        onBeforeLift={onBeforeLift}
        loading={null}
        persistor={persistor}>
        <NavigationContainer ref={navigationRef} linking={DEEP_LINKING}>
          <StatusBar
            translucent
            backgroundColor="rgba(255,255,255,0.1)"
            barStyle="dark-content"
          />
          <RootScreen />
          <NotificationModal isVisible={isVisible} />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default codePush(MyApp);
