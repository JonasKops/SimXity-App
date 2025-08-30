/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  Text,
  View,
  Image,
  Alert,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import styles from './styles';
import {useDispatch, useSelector} from 'react-redux';
import {Client} from 'app-api';
import IconF from 'react-native-vector-icons/Feather';

import ImagePicker from 'react-native-image-crop-picker';
import {showLoading} from '../../../actions/common';
import {setUser} from '../../../actions/user';
import i18n from '../../../config/translations';
import {Images} from '../../../assets';
import {CommonActions} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const deviceWidth = Dimensions.get('window').width;

const GeneralSetting = ({navigation}) => {
  const user = useSelector(state => state.user);

  const dispatch = useDispatch();
  const [avatar, setAvatar] = useState(null);
  const [description, setDescription] = useState(user?.info?.description || '');
  const [firstName, setFirstName] = useState(user?.info?.first_name || '');
  const [lastName, setLastName] = useState(user?.info?.last_name || '');
  const [nickName, setNickName] = useState(user?.info?.nickname || '');

  const onUpload = async () => {
    // TODO: CHECK PERMISSION DENIED

    ImagePicker.openPicker({
      width: Number(user?.info?.avatar_size?.width) || 250,
      height: Number(user?.info?.avatar_size?.height) || 250,
      cropping: true,
      multiple: false,
      mediaType: 'photo',
    })
      .then(image => {
        setAvatar(image);
      })
      .catch(error => {
        Alert.alert('', error.message || 'Error');
      });
  };

  const submitGeneral = async () => {
    Keyboard.dismiss();

    if (nickName.trim() === '') {
      Alert.alert('Please enter nickname');
      return;
    }

    const param = new FormData();
    param.append('first_name', firstName);
    param.append('last_name', lastName);
    param.append('nickname', nickName);
    param.append('description', description);

    if (avatar) {
      const file = {
        uri: avatar?.path,
        type: avatar?.mime,
        name: avatar?.path.split('/').pop(),
      };

      param.append('lp_avatar_file', file);
    }

    dispatch(showLoading(true));
    const response = await Client.updateUser(user?.info?.id, param);

    dispatch(showLoading(false));

    if (response?.code) {
      Alert.alert(response?.message || 'Error');
    } else {
      Alert.alert('Changes saved.');
      dispatch(setUser(response));
    }
  };

  const INPUT_FIELDS = [
    {
      label: 'settings.firstName',
      value: firstName,
      method: setFirstName,
    },
    {
      label: 'settings.lastName',
      value: lastName,
      method: setLastName,
    },
    {
      label: 'settings.nickName',
      value: nickName,
      method: setNickName,
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

        <Text style={styles.title}>{i18n.t('settings.general')}</Text>
        <Text />
      </View>
      <KeyboardAvoidingView style={styles.keyboard} behavior="padding" enabled>
        <ScrollView
          style={styles.wrapper}
          contentContainerStyle={{paddingBottom: 20}}
          showsVerticalScrollIndicator={false}>
          {avatar?.path || avatar?.sourceURL || user?.info?.avatar_url ? (
            <Image
              source={{
                uri:
                  avatar?.path || avatar?.sourceURL || user?.info?.avatar_url,
              }}
              style={[
                styles.viewAvatar,
                {
                  width:
                    (user?.info?.avatar_size?.width &&
                      (Number(user?.info?.avatar_size?.width) < deviceWidth
                        ? Number(user?.info?.avatar_size?.width)
                        : deviceWidth - 32)) ||
                    250,
                  height:
                    (user?.info?.avatar_size?.width &&
                      (Number(user?.info?.avatar_size?.width) < deviceWidth
                        ? Number(user?.info?.avatar_size?.height)
                        : (Number(user?.info?.avatar_size?.height) *
                            (deviceWidth - 32)) /
                          Number(user?.info?.avatar_size?.width))) ||
                    250,
                },
              ]}
            />
          ) : null}
          <TouchableOpacity onPress={() => onUpload()} style={styles.uploadBtn}>
            <Text style={styles.txtBtnUpload}>{i18n.t('settings.upload')}</Text>
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.titleChild}>{i18n.t('settings.bio')}</Text>
            <IconF name="edit-2" style={styles.icon} />
          </View>
          <View style={styles.viewInputBio}>
            <TextInput
              style={styles.textInputBio}
              multiline
              value={description}
              onChangeText={value => setDescription(value)}
            />
          </View>
          {INPUT_FIELDS.map((field, index) => (
            <View key={'general-setting ' + index}>
              <View style={styles.inputWrapper}>
                <Text style={styles.titleChild}>{i18n.t(field.label)}</Text>
                <IconF name="edit-2" style={styles.icon} />
              </View>
              <View style={styles.viewInput}>
                <TextInput
                  style={styles.txtInput}
                  numberOfLines={1}
                  value={field.value}
                  onChangeText={value => field.method(value)}
                />
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => submitGeneral()}>
            <Text style={styles.titleChild}>{i18n.t('settings.save')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
export default GeneralSetting;
