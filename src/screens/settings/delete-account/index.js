import React, {useState} from 'react';
import styles from './styles';
import {
  Text,
  View,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Client, setToken} from 'app-api';

import {deleteFCMToken} from 'app-common';
import {showLoading} from '../../../actions/common';
import {
  saveUserToken,
  setUser,
  setOverview,
  setRecentSearch,
} from '../../../actions/user';
import {resetNotifications} from '../../../actions/notifications';
import i18n from '../../../config/translations';
import {Image} from 'react-native';
import {Images} from '../../../assets';
import {CommonActions} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const DeleteAccountSetting = ({navigation}) => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [deletePassword, setDeletePassword] = useState('');

  const onDeletedAccount = async () => {
    if (!deletePassword) {
      Alert.alert('', i18n.t('settings.deleteAccountPasswordEmpty'));
      return;
    }
    dispatch(showLoading(true));
    const response = await Client.deleteAccount({
      id: user?.info?.id,
      password: deletePassword,
    });

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

  return (
    <View style={styles.container}>
      <Image source={Images.bannerMyCourse} style={styles.imgBanner} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(CommonActions.goBack())}>
          <Icon name="arrow-back-outline" size={26} />
        </TouchableOpacity>

        <Text style={styles.title}>{i18n.t('settings.deleteAccount')}</Text>
        <Text />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.deleteAccountTitle}>
              {i18n.t('settings.deleteAccountTitle')}
            </Text>
            <Text style={styles.deleteAccountTitle2}>
              {i18n.t('settings.deleteAccountTitle2')}
            </Text>
            <Text style={styles.deleteAccountContent}>
              {i18n.t('settings.deleteAccountContent')}
            </Text>
            <Text style={styles.deleteAccountContent2}>
              {i18n.t('settings.deleteAccountContent2')}
            </Text>
            <View style={styles.viewInput}>
              <TextInput
                style={styles.txtInput}
                numberOfLines={1}
                secureTextEntry
                onChangeText={value => setDeletePassword(value)}
              />
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDeletedAccount()}>
              <Text style={styles.deleteTextBtn}>
                {i18n.t('settings.deleteAccountBtn')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default DeleteAccountSetting;
