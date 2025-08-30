import React from 'react';
import styles from './styles';
import {CommonActions} from '@react-navigation/native';
import i18n from '../../config/translations';
import {View, Image, ScrollView, TouchableOpacity} from 'react-native';
import {Images} from 'app-assets';
import {Text} from 'react-native';
import IconI from 'react-native-vector-icons/Ionicons';
import IconF from 'react-native-vector-icons/Feather';

const SETTING_LIST = [
  {
    icon: <IconF name="settings" size={18} />,
    label: 'settings.general',
    value: 'GeneralScreen',
  },
  {
    icon: <IconF name="lock" size={18} />,
    label: 'settings.password',
    value: 'PasswordScreen',
  },
  {
    icon: <IconI name="language" size={18} />,
    label: 'settings.language',
    value: 'LanguageScreen',
  },
  {
    icon: <IconF name="trash-2" size={18} />,
    label: 'settings.deleteAccount',
    value: 'DeleteAccountScreen',
  },
];

const Settings = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Image source={Images.bannerMyCourse} style={styles.imgBanner} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(CommonActions.goBack())}>
          <IconI name="arrow-back-outline" size={26} />
        </TouchableOpacity>

        <Text style={styles.title}>{i18n.t('settings.title')}</Text>
        <Text />
      </View>

      <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
        {SETTING_LIST.map((list, index) => (
          <TouchableOpacity
            key={'list' + index}
            onPress={() => navigation.navigate(list.value)}
            style={styles.itemWrapper}>
            <View style={styles.item}>
              <View style={styles.itemInner}>
                {list.icon}
                <Text style={styles.text}>{i18n.t(list.label)}</Text>
              </View>
              <IconI name="chevron-forward-outline" size={18} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Settings;
