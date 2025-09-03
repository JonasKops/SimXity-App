import React, {PureComponent} from 'react';
import {
  DeviceEventEmitter,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  BackHandler,
  Alert,
  Keyboard,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {withTranslation} from 'react-i18next';
import {Images} from 'app-assets';
import {Client, setToken} from 'app-api';
import {connect} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';
import {saveUserToken, setUser} from '../../actions/user';
import {setLoading} from '../../actions/common';
import {saveNotifications} from '../../actions/notifications';
import notifee from '@notifee/react-native';
import {store} from '../../index';

class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false,
    };
    this.backHandler = null;
    // timers used to simulate incoming push notifications for presentation
    this._fakeNotificationTimers = [];
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
    // NOTE: do NOT clear fake notification timers on unmount so scheduled notifications
    // still fire after navigation away from the Login screen. Leaving timers alive
    // ensures the 2s and 7s simulated notifications are delivered.
    // this._fakeNotificationTimers = [];
  }

  // Generate 20 fake certificates. Some will be expiring soon (within 1..10 days).
  generateFakeCertificates = userId => {
    const certificates = [];
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      // give some certs near-expiry and others later
      const daysToExpire = i < 8 ? (1 + (i % 10)) : (30 + (i % 180));
      const expiresAt = new Date(now + daysToExpire * 24 * 60 * 60 * 1000).toISOString();
      certificates.push({
        id: `cert-${userId}-${i + 1}`,
        title: `Certificate ${i + 1}`,
        expiresAt,
      });
    }

    // --- Presentation-only: ensure two specific demo certificates exist and expire soon ---
    // These match the screenshots/titles you provided but use near-future expiry dates so
    // the login simulation will trigger push + in-app notifications for presentation.
    const demo1 = {
      id: `demo-cert-1-${userId}`,
      title: 'Recurrent Aviation First Aid',
      expiresAt: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    };

    const demo2 = {
      id: `demo-cert-2-${userId}`,
      title: 'Crew Resource Management Recurrent',
      expiresAt: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    };

    // Prepend demo certs so they appear first
    return [demo1, demo2].concat(certificates);
  };

  // Simulate push notifications for certificates that are expiring soon.
  // Emits DeviceEventEmitter events and schedules a few repeated notifications for presentation.
  simulatePushNotifications = certificates => {
    console.log('simulatePushNotifications called, certificates count =', Array.isArray(certificates) ? certificates.length : typeof certificates);
    const soonThresholdDays = 7;
    const now = Date.now();
    const soonCerts = certificates.filter(cert => {
      const diffDays = (new Date(cert.expiresAt).getTime() - now) / (24 * 60 * 60 * 1000);
      return diffDays <= soonThresholdDays;
    });

    if (soonCerts.length > 0) {
      // immediate in-app alert to demonstrate notification summary
      Alert.alert(
        'Certificates expiring soon',
        `${soonCerts.length} certificate(s) will expire within ${soonThresholdDays} days.`
      );
      // emit a single event so other screens/components can react
      DeviceEventEmitter.emit('fakeCertificatesExpiring', {count: soonCerts.length, items: soonCerts});
    }

    // Ensure permissions and channel exist, then schedule exactly two notifications: at 2s and 7s
    (async () => {
      try {
        console.log('simulatePushNotifications: requesting notifee permission');
        const settings = await notifee.requestPermission();
        console.log('simulatePushNotifications: notifee.requestPermission result', settings);
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          try {
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
          } catch (e) {
            console.log('POST_NOTIFICATIONS request error', e);
          }
        }
        if (Platform.OS === 'android') {
          try {
            console.log('simulatePushNotifications: creating android channel default');
            const channelId = await notifee.createChannel({ id: 'default', name: 'Default', importance: 4 });
            console.log('simulatePushNotifications: createChannel returned', channelId);
          } catch (e) {
            console.log('createChannel error in simulatePushNotifications', e);
          }
        }

        // pick up to two certs to show; if fewer than 2, still schedule available ones
        const toShow = soonCerts.slice(0, 2);
        const delays = [2000, 7000]; // ms after login: 2s and 7s
        console.log('simulatePushNotifications: scheduling', toShow.length, 'timed notifications with delays', delays);

        toShow.forEach((cert, idx) => {
          const delayMs = delays[idx] || delays[delays.length - 1];
          console.log(`simulatePushNotifications: scheduling timer idx=${idx} certId=${cert.id} delayMs=${delayMs}`);
          const timer = setTimeout(async () => {
            const payload = {
              title: 'Certificate expiring',
              message: `${cert.title} expires on ${new Date(cert.expiresAt).toLocaleDateString()}`,
              cert,
            };

            console.log('Simulated timed notification firing:', payload);

            // display system notification
            try {
              await notifee.displayNotification({
                title: payload.title,
                body: payload.message,
                android: { channelId: 'default' },
              });
              try { await notifee.incrementBadgeCount(1); } catch (e) {}
            } catch (e) {
              console.log('Timed notifee display error', e);
            }

            // emit in-app event
            DeviceEventEmitter.emit('pushNotificationReceived', payload);

            // save to Redux so NotificationsScreen displays them
            try {
              const notifObj = {
                notification_id: Date.now() + idx,
                title: payload.title,
                content: payload.message,
                date_created: new Date().toISOString(),
                cert: payload.cert,
              };
              const existing = (this.props.notifications && this.props.notifications.list) || [];
              this.props.dispatch(saveNotifications([notifObj].concat(existing)));
              console.log('Dispatched saveNotifications for timed simulated notif', notifObj.notification_id);
            } catch (e) {
              console.log('dispatch saveNotifications error (timed)', e);
            }
          }, delayMs);

          console.log('simulatePushNotifications: timer created and pushed to _fakeNotificationTimers');
          this._fakeNotificationTimers.push(timer);
        });
      } catch (e) {
        console.log('simulatePushNotifications permission/channel error', e);
      }
    })();
  };

  validate() {
    const {t} = this.props;
    const {username, password} = this.state;
    if (!username || username.length === 0) {
      Alert.alert('', t('loginScreen.usernameEmpty'));
      return false;
    }
    if (!password || password.length === 0) {
      Alert.alert('', t('loginScreen.passwordEmpty'));
      return false;
    }
    return true;
  }

  onLogin = async () => {
    const {t} = this.props;
    Keyboard.dismiss();
    const {dispatch} = this.props;
    if (!this.validate()) {
      return;
    }

    dispatch(setLoading(true));

    try {
      const {username, password} = this.state;

      const params = {
        username,
        password,
      };

      const response = await Client.login(params);

      if (response && response?.token) {
        dispatch(saveUserToken(response.token));
        dispatch(setUser(response));
        setToken(response.token);

        const {navigation, route} = this.props;
        console.log('ID ' + response.user_id);
        if (route.params?.screen) {
          const responseUser = await Client.getUser(response.user_id);
          dispatch(setUser(responseUser));
          if (
            route.params?.screen === 'CoursesDetailsScreen' &&
            route.params?.id
          ) {
            navigation.navigate('CoursesDetailsScreen', {
              id: route.params.id,
            });
          } else {
            navigation.navigate(route.params.screen);
          }
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'HomeTabScreen'}],
          });
        }

        DeviceEventEmitter.emit('notificationReceived');
        // --- Presentation-only: simulate user's certificates and in-app "push" notifications ---
        // We can't access backend now, so create fake certificates and simulate notifications.
        const fakeCertificates = this.generateFakeCertificates(response.user_id);
        // Immediately add two demo notifications to Redux so Notifications screen shows them reliably
        try {
          const existing = (this.props.notifications && this.props.notifications.list) || [];
          const nowTs = Date.now();
          const demo1 = {
            notification_id: nowTs,
            title: 'Recurrent Aviation First Aid',
            content: `Recurrent Aviation First Aid expires on ${new Date(fakeCertificates[0].expiresAt).toLocaleDateString()}`,
            date_created: new Date().toISOString(),
            cert: fakeCertificates[0],
          };
          const demo2 = {
            notification_id: nowTs + 1,
            title: 'Crew Resource Management Recurrent',
            content: `Crew Resource Management Recurrent expires on ${new Date(fakeCertificates[1].expiresAt).toLocaleDateString()}`,
            date_created: new Date().toISOString(),
            cert: fakeCertificates[1],
          };
          this.props.dispatch(saveNotifications([demo1, demo2].concat(existing)));
          console.log('Dispatched immediate demo notifications', demo1.notification_id, demo2.notification_id);
          // Also show system notifications immediately so they are visible in the device shade
          (async () => {
            try {
              console.log('Displaying immediate demo system notifications - requesting permission');
              const settings = await notifee.requestPermission();
              console.log('notifee.requestPermission result', settings);
              if (Platform.OS === 'android' && Platform.Version >= 33) {
                try {
                  await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                } catch (e) {
                  console.log('POST_NOTIFICATIONS request error', e);
                }
              }
              if (Platform.OS === 'android') {
                try {
                  await notifee.createChannel({id: 'default', name: 'Default', importance: 4});
                } catch (e) {
                  console.log('createChannel error (immediate demo)', e);
                }
              }

              try {
                await notifee.displayNotification({ title: demo1.title, body: demo1.content, android: { channelId: 'default' } });
                await notifee.displayNotification({ title: demo2.title, body: demo2.content, android: { channelId: 'default' } });
                try { await notifee.incrementBadgeCount(2); } catch (e) { console.log('incrementBadgeCount error', e); }
                console.log('Immediate demo system notifications displayed');
              } catch (e) {
                console.log('displayNotification error (immediate demo)', e);
              }
            } catch (e) {
              console.log('immediate demo notification permission/channel error', e);
            }
          })();
          DeviceEventEmitter.emit('pushNotificationReceived', {title: demo1.title, message: demo1.content, cert: demo1.cert});
          DeviceEventEmitter.emit('pushNotificationReceived', {title: demo2.title, message: demo2.content, cert: demo2.cert});
        } catch (e) {
          console.log('error dispatching immediate demo notifications', e);
        }
        this.simulatePushNotifications(fakeCertificates);
        // -------------------------------------------------------------------------------------
      } else if (response && response.code && response.code.includes('incorrect_password')) {
        Alert.alert('', t('loginScreen.passwordNotCorrect'));
      } else if (response && response.code && response.code.includes('invalid_username')) {
        Alert.alert('', t('loginScreen.usernameNotCorrect'));
      } else {
        Alert.alert('', t('loginScreen.notFound'));
      }
    } catch (e) {
      console.log('onLogin error', e);
      Alert.alert('', t('loginScreen.notFound'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  handleBackPress = () => {
    const { navigation } = this.props;
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // if no back stack, exit the app on hardware back press
      BackHandler.exitApp();
    }
    return true;
  };

  onBack = () => {
    const {navigation} = this.props;
    console.log('Login.onBack called, canGoBack=', navigation && navigation.canGoBack && navigation.canGoBack());
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      // fallback when there's no back stack (ensures UI back arrow always does something)
      navigation.navigate('HomeTabScreen');
    }
  };

  render() {
    const {username, password} = this.state;
    const {t, navigation} = this.props;

    return (
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always">
        <Image source={Images.iconBannerLogin2} style={styles.imgBanner} />
        <View style={{marginTop: 80}}>
          <TouchableOpacity
            // enlarge touch area and add visual padding so the icon is easy to tap
            style={{marginLeft: 16, width: 80, height: 44, justifyContent: 'center', paddingLeft: 6}}
            onPress={() => { console.log('UI back arrow pressed'); this.onBack(); }}
            hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <Image source={Images.iconBack} style={styles.iconBack} />
          </TouchableOpacity>
          <View style={styles.viewLogo}>
            <Image source={Images.LogoSchool} style={styles.logo} />
            <Text style={styles.title}>{t('loginScreen.title')}</Text>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled">
          <View style={{paddingHorizontal: 46, marginTop: 35}}>
            <View
              style={[
                styles.viewInput,
                username.length > 0
                  ? {borderWidth: 2, borderColor: '#000'}
                  : {},
              ]}>
              <TextInput
                ref={ref => {
                  this.username = ref;
                }}
                placeholder={t('loginScreen.usernamePlaceholder')}
                placeholderTextColor="#9E9E9E"
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={value => this.setState({username: value})}
              />
              {username.length > 0 && (
                <Image source={Images.icEnterUsername} style={styles.icEnter} />
              )}
            </View>
            <View
              style={[
                styles.viewInput,
                password.length > 0
                  ? {borderWidth: 2, borderColor: '#000'}
                  : {},
              ]}>
              <TextInput
                ref={ref => {
                  this.password = ref;
                }}
                secureTextEntry={!this.state.showPassword}
                placeholder={t('loginScreen.passwordPlaceholder')}
                autoCapitalize="none"
                placeholderTextColor="#9E9E9E"
                style={styles.textInput}
                value={password}
                onChangeText={value => this.setState({password: value})}
              />
              {password.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    this.setState({showPassword: !this.state.showPassword})
                  }>
                  <Image
                    source={Images.icEnterPassword}
                    style={styles.icEnter}
                  />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.btnSubmit} onPress={this.onLogin}>
              <Text style={styles.txtSubmit}>{t('loginScreen.btnLogin')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotScreen')}>
              <Text style={styles.txtForgot}>
                {t('loginScreen.forgotPassword')}
              </Text>
            </TouchableOpacity>
            {/* <View style={styles.viewLine}>
              <View style={styles.line} />
              <Text>or</Text>
              <View style={styles.line} />
            </View>
            <View style={styles.viewButton}>
              <TouchableOpacity>
                <Image
                  source={Images.iconFacebook}
                  style={styles.iconFacebook}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={Images.iconTwitter} style={styles.iconTwitter} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={Images.iconGoogle} style={styles.iconGoogle} />
              </TouchableOpacity>
            </View> */}
            <View style={styles.imgBottom}>
              <Text style={styles.textBottom}>
                {t('loginScreen.registerText')}
              </Text>
              <TouchableOpacity onPress={this.onRegister}>
                <Text
                  style={[
                    styles.textBottom,
                    {textDecorationLine: 'underline'},
                  ]}>
                  {' '}
                  {t('loginScreen.register')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    );
  }
}
const mapStateToProps = ({network}) => ({
  network,
  notifications: (state => state.notifications)( /* placeholder - will be replaced by connect */ ),
});
const mapDispatchToProps = dispatch => ({dispatch});

export default connect(
  // connect can't accept a lambda in mapStateToProps string above; replace with actual mapping
  (state) => ({ network: state.network, notifications: state.notifications }),
  mapDispatchToProps,
)(withTranslation()(Login));
