/* eslint-disable react/react-in-jsx-scope */
import {useDispatch, useSelector} from 'react-redux';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import styles from './styles';
import {useState} from 'react';
import IconI from 'react-native-vector-icons/Ionicons';
import i18n from '../../../config/translations';
import {setLanguage} from '../../../actions/language';
import {Images} from '../../../assets';

const LANGUAGE_OPTIONS = [
  {label: 'English', value: 'en'},
  {label: '한국인', value: 'ko'},
  {label: 'Português', value: 'pt'},
  {label: 'Español', value: 'es'},
];

const LanguageSetting = ({navigation}) => {
  const dispatch = useDispatch();
  const {language} = useSelector(state => state.language);
  const [selected, setSelected] = useState('');

  const changeLanguage = lng => {
    try {
      dispatch(setLanguage(lng));
      i18n.changeLanguage(lng);
      Alert.alert('', i18n.t('settings.languageUpdated'), [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeTabScreen'}],
            }),
        },
      ]);
    } catch (error) {
      Alert.alert('', error.message || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={Images.bannerMyCourse} style={styles.imgBanner} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconI name="arrow-back-outline" size={26} />
        </TouchableOpacity>

        <Text style={styles.title}>{i18n.t('settings.language')}</Text>
        <Text />
      </View>
      <View style={styles.wrapper}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {LANGUAGE_OPTIONS.map((lang, i) => (
            <TouchableOpacity
              key={'lang' + i}
              style={styles.touchLang}
              onPress={() => setSelected(lang.value)}>
              <Text style={styles.textLang}>{lang.label}</Text>
              {(selected && selected === lang.value) ||
              (!selected && language === lang.value) ? (
                <IconI name="checkmark-circle" style={styles.icon} />
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.updateContainer}>
        <TouchableOpacity
          style={styles.updateBtn}
          onPress={() => changeLanguage(selected)}>
          <Text style={styles.updateText}>{i18n.t('settings.update')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LanguageSetting;
