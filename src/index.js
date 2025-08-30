import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {Platform, StatusBar, DeviceEventEmitter} from 'react-native';
import {PersistGate} from 'redux-persist/integration/react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import codePush from 'react-native-code-push';
import notifee, {EventType, AuthorizationStatus} from '@notifee/react-native';
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
    })();
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
          await store.dispatch(
            saveNotifications(response?.data?.notifications || []),
          );
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
