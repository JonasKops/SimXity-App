import React, {useState} from 'react';
import {
  Text,
  View,
  Alert,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useDispatch} from 'react-redux';
import IconF from 'react-native-vector-icons/Feather';
import {showLoading} from '../../../actions/common';

import styles from './styles';
import i18n from '../../../config/translations';
import {Client, setToken} from 'app-api';

import {deleteFCMToken} from 'app-common';
import {
  saveUserToken,
  setUser,
  setOverview,
  setRecentSearch,
} from '../../../actions/user';
import {resetNotifications} from '../../../actions/notifications';
import {Image} from 'react-native';
import {Images} from '../../../assets';
import {CommonActions} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const PasswordSetting = ({navigation}) => {
  const dispatch = useDispatch();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, SetShowCurrentPassword] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  const submitPassword = async () => {
    Keyboard.dismiss();
    if (oldPassword.trim() === '') {
      Alert.alert('', i18n.t('settings.emptyCurrentPassword'));
      return;
    }

    if (newPassword.trim() === '') {
      Alert.alert('', i18n.t('settings.emptyNewPassword'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('', i18n.t('settings.passwordNotMatch'));
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('', i18n.t('settings.passwordAlreadyExists'));
      return;
    }

    const params = {
      old_password: oldPassword,
      new_password: newPassword,
    };

    dispatch(showLoading(true));

    const response = await Client.changePassword(params);

    dispatch(showLoading(false));

    if (response.code === 'success') {
      Alert.alert(response.message);
      onLogout();
    } else {
      Alert.alert(response.message);
    }
  };

  const onLogout = async () => {
    dispatch(showLoading(true));
    deleteFCMToken();
    dispatch(showLoading(false));

    navigation.reset({
      index: 0,
      routes: [{name: 'LoginScreen'}],
    });

    dispatch(setUser(null));
    dispatch(saveUserToken(null));
    dispatch(setRecentSearch([]));
    dispatch(setOverview(null));
    dispatch(resetNotifications());
    setToken(null);
  };
  const toggleShowCurrentPassword = () => {
    SetShowCurrentPassword(!showCurrentPassword);
  };

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const PASSWORD_LIST = [
    {
      title: 'settings.currentPassword',
      secureTextEntry: showCurrentPassword,
      onChangeText: setOldPassword,
      onPress: toggleShowCurrentPassword,
    },
    {
      title: 'settings.newPassword',
      secureTextEntry: showNewPassword,
      onChangeText: setNewPassword,
      onPress: toggleShowNewPassword,
    },
    {
      title: 'settings.confirmNewPassword',
      secureTextEntry: showConfirmPassword,
      onChangeText: setConfirmPassword,
      onPress: toggleShowConfirmPassword,
    },
  ];

  return (
    <View style={styles.container}>
      <Image source={Images.bannerMyCourse} style={styles.imgBanner} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(CommonActions.goBack())}>
          <Icon name="arrow-back-outline" size={26} />
        </TouchableOpacity>

        <Text style={styles.title}>{i18n.t('settings.password')}</Text>
        <Text />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.wrapper}>
          <View>
            {PASSWORD_LIST.map((item, index) => (
              <View key={'setting-password' + index}>
                <View style={styles.textWrapper}>
                  <Text style={styles.titleChild}>{i18n.t(item.title)}</Text>
                </View>
                <View style={styles.viewInput}>
                  <TextInput
                    style={styles.txtInput}
                    numberOfLines={1}
                    secureTextEntry={item.secureTextEntry}
                    onChangeText={value => item.onChangeText(value)}
                  />
                  <TouchableOpacity
                    style={styles.btnViewPass}
                    onPress={() => item.onPress()}>
                    {item.secureTextEntry ? (
                      <IconF name="eye" style={styles.icon} />
                    ) : (
                      <IconF name="eye-off" style={styles.icon} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => submitPassword()}>
              <Text style={styles.titleChild}>{i18n.t('settings.save')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PasswordSetting;
