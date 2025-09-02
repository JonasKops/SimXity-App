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
} from 'react-native';
import {withTranslation} from 'react-i18next';
import {Images} from 'app-assets';
import {Client, setToken} from 'app-api';
import {connect} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';
import {saveUserToken, setUser} from '../../actions/user';
import {setLoading} from '../../actions/common';

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
    // clear any pending fake notification timers on unmount
    this._fakeNotificationTimers.forEach(timer => clearTimeout(timer));
    this._fakeNotificationTimers = [];
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
    return certificates;
  };

  // Simulate push notifications for certificates that are expiring soon.
  // Emits DeviceEventEmitter events and schedules a few repeated notifications for presentation.
  simulatePushNotifications = certificates => {
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

    // Schedule a few simulated incoming notifications (for presentation)
    // They will fire a few seconds apart so the presenter can see multiple notifications.
    soonCerts.slice(0, 6).forEach((cert, idx) => {
      const delayMs = 2000 + idx * 3000; // 2s, 5s, 8s, ...
      const timer = setTimeout(() => {
        const payload = {
          title: 'Certificate expiring',
          message: `${cert.title} expires on ${new Date(cert.expiresAt).toLocaleDateString()}`,
          cert,
        };
        console.log('Simulated push notification:', payload);
        DeviceEventEmitter.emit('pushNotificationReceived', payload);
        // also show a lightweight Alert for demo (avoid too many alerts)
        if (idx === 0) {
          // only show alert for the first one to avoid spamming
          Alert.alert(payload.title, payload.message);
        }
      }, delayMs);
      this._fakeNotificationTimers.push(timer);
    });
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

  onBack = () => {
    const {navigation} = this.props;
    navigation.goBack();
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
            style={{marginLeft: 16, width: 50}}
            onPress={this.onBack}
            hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}>
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
});
const mapDispatchToProps = dispatch => ({dispatch});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(Login));
