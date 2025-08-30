import React, {Component} from 'react';
import {
  Text,
  Button,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  PermissionsAndroid,
  Platform, 
  Alert
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {withTranslation} from 'react-i18next';
import i18n from '../../config/translations';
import {Images} from 'app-assets';
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

      // Android: Speicherberechtigung einholen
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Dateizugriff',
            message: 'App benötigt Zugriff zum Speichern der Datei.',
            buttonNeutral: 'Später',
            buttonNegative: 'Abbrechen',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Berechtigung verweigert');
          return;
        }
      }

      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: destPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        Alert.alert('Download erfolgreich', `Datei gespeichert unter:\n${destPath}`);
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
            { /*<Image
              source={Images.backgroundBanner}
              style={{position: 'absolute', bottom: 0, width: '100%'}}
            />*/}
          </FastImage>
		  
          <View style={styles.content2}>   
            {course ? (
              <>               
                <Button title="PNG herunterladen" onPress={this.downloadImage} />

               {/*<Text style={styles.txtTitle}>
                  {course}
                </Text>	
                <View style={styles.item}>
                    <Text style={styles.txtTitle}>
                      {i18n.t('myCertificateDetails.date')}
                    </Text>
                    <Text style={styles.txtTitle}>
                      {date.slice(0, 10).replace(/-/g, '/')}
                    </Text>						           
                </View>  
                */}
              </>
            ) : null}
	
            <View style={styles.line} />

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
