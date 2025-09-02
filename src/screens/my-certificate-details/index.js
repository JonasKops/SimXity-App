import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  PermissionsAndroid,
  Pressable,
  Platform, 
  Alert
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {withTranslation} from 'react-i18next';
import i18n from '../../config/translations';
import {Images} from 'app-assets';
import IconF from 'react-native-vector-icons/Feather';
import {connect} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';
import {showLoading} from '../../actions/common';
import RNFS from 'react-native-fs';

class CertificateDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
	    url: '',
    };
    this.id = null;
    this.backHandler = null;
  }

  async componentDidMount() {	
    await this.getData();    
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBackPress,
    );
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
  }

  async getData() {
    const {route, dispatch, user, certificate} = this.props;
    try {
      await dispatch(showLoading(true));
      this.id = route.params?.id;
      const entry = certificate.certificate.find(item => item.id == this.id);
      if (entry) {
        this.setState({
          course: entry.course_title,
          date: entry.issued_date,
          url: entry.cert_url,
        });			
      } else {
        this.setState({
          url: "",
        });				
      }
      await dispatch(showLoading(false));
    } catch (e) {
      dispatch(showLoading(false));
      console.log(e.message || 'Error when get certificate data');
    }
  }

  handleBackPress = () => {
    const {navigation} = this.props;

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Go to Home page
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeTabScreen'}],
      });
    }
    return true;
  };

  goBack = () => {
    const {navigation} = this.props;

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Go to Home page
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeTabScreen'}],
      });
    }
  };

  downloadImage = async () => {
     const {
      course,
	    url
    } = this.state;

   try {
      const fileUrl = url;
      const fileName = course + '.png';

      const destPath =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}` // Android → Downloads
          : `${RNFS.DocumentDirectoryPath}/${fileName}`; // iOS → App-Verzeichnis

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: i18n.t('myCertificateDetails.download.title'),
            message: i18n.t('myCertificateDetails.download.message'),
            buttonNeutral: i18n.t('myCertificateDetails.download.buttonNeutral'),
            buttonNegative: i18n.t('myCertificateDetails.download.buttonNegative'),
            buttonPositive: i18n.t('myCertificateDetails.download.buttonPositive'),
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(i18n.t('myCertificateDetails.download.permissionDenied'));  
          return;
        }
      }

      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: destPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
                                                                              
        Alert.alert(i18n.t('myCertificateDetails.download.downloadSuccessful'), `${i18n.t('myCertificateDetails.download.fileSavedAs')}: \n${destPath}`);
      } else {
        Alert.alert('Fehler beim Download', `Status Code: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      Alert.alert('Fehler', error.message);
    }

  }
  
  render() {
    const {
	  course,
	  url,
    } = this.state;
    //const {t, navigation} = this.props;
    return (
      <View style={styles.container}>
        <Image source={Images.bannerMyCourse} style={styles.imgBanner} />
        <View style={styles.header}>
          
          <View style={styles.header1}>
            <TouchableOpacity
              onPress={this.goBack}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <Text style={styles.title}>{i18n.t('myCertificateDetails.title')}</Text>
            <View style={styles.iconBack} />
          </View>
          <View style={styles.header2}>
            <Text style={styles.txtTitle}>
              {course}
            </Text>	
          </View>
        </View>

        <KeyboardAwareScrollView
          removeClippedSubviews={false}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 150}} 
          keyboardShouldPersistTaps="handled"
		    >
          <FastImage
            style={styles.imageBanner}
            source={{
				      uri: url,
            }}>

            <View
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 2,
                right: 16,
              }}>
              <Text numberOfLines={2} style={styles.txt2}>
              
              </Text>
            </View>
          </FastImage>
		  
            <View style={styles.content2}>   
              {course ? (
                <>    
                <Pressable
                  onPress={() => this.downloadImage()}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: pressed ? '#0056b3' : '#007BFF', 
                    },
                  ]}
                >
                  <IconF name="download" size={22} color="#fff" />
                  <Text style={{ color: '#fff', marginLeft: 10 }}>
                    {i18n.t('myCertificateDetails.download.download')}
                  </Text>
                </Pressable>

                </>
              ) : null}
            </View>
        </KeyboardAwareScrollView>

      </View>
    );
  }
}
const mapStateToProps = ({user, certificate}) => ({
  user,
  certificate,
});
const mapDispatchToProps = dispatch => ({dispatch});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(CertificateDetails));
