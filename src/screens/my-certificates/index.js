import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  BackHandler,
  DeviceEventEmitter,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {ListMyCertificate} from 'app-component';
import {Client} from 'app-api';
import {Images} from 'app-assets';
import styles from './styles';
import jwtDecode from 'jwt-decode';
import {setCertificate} from '../../actions/certificate';

class MyCertificate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowFilter: false,
      showAnimatedSearh: false,
      data: [],
      page: 1,
      isLoadMore: true,
      filter: '',
      keySearch: '',
      refreshing: false,
      isLoading: true,
      showFooter: false,
    };

    this.isFetchData = true;
    this.eventListener = null;
    this.backHandler = null;
  }

  async componentDidMount() {
    const {navigation} = this.props;
	
    this.focusListener = navigation.addListener('focus', async () => {
      if (this.isFetchData) {
        await this.getData();
      }
      this.isFetchData = false;
    });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    this.eventListener = DeviceEventEmitter.addListener(
      'loadMyCertificates',
      this.refreshData,
    );
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
    if (this.backHandler) {
      this.backHandler.remove();
    }
    if (this.eventListener) {
      this.eventListener.remove();
    }
  }

  refreshData = async () => {ps;
    this.setState({refreshing: true});
    this.setState({isLoading: false});
	  this.getData();
	  this.setState({refreshing: false});
    this.setState({isLoading: false});
  };

  handleBackPress = () => {
    const {navigation} = this.props;
    navigation.goBack(null);
    return true;
  };

  goBack = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  getData = async () => {
	  const {user, dispatch} = this.props;
    const {page} = this.state;

    if (user?.token) {		     
      const tokenDecode = jwtDecode(user.token);
      const param = {
        page,
        per_page: 10,
      };
      const response = await Client.getCertificates(tokenDecode.data.user.id, param);
      const newData = []; 

console.log(JSON.stringify(response, null, 2));
  
      for (let i = 0; i < response.length; i += 1) {
        const element = response[i];
        if (
          this.state.data.length === 0 ||
          this.state.data.find(x => x.id !== element.id)
        ) {;
          console.log(JSON.stringify(element, null, 2));
          newData.push(element);
        }
      }
      const newList = page === 1 ? newData : this.state.data.concat(newData);

      dispatch(setCertificate(newList));      
      this.setState({    
        data: page === 1 ? newData : this.state.data.concat(newData),
        refreshing: false,
        isLoading: false,
        isLoadMore: response.length === 10,
      });
    }
  };

  onAnimatedSearch = () => {
    this.setState({showAnimatedSearh: true});

    setTimeout(() => {
      this.inputSearch.focus();
    }, 200);
  };

  handleLoadMore = async () => {
    const {page, isLoadMore} = this.state;
    if (!isLoadMore) {
      return;
    }
    await this.setState({
      page: page + 1,
    });
    await this.getData();
  };

  onRefresh = async () => {
    await this.setState({
      refreshing: true,
      data: [],
      page: 1,
    });
    await this.getData();
    await this.setState({refreshing: false});
  };

    refreshScreen() {
      const { refreshing } = this.state;
  
      return (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={this.onRefresh}
          progressViewOffset={30}
        />
      );
    }

  render() {
    const {
      data,
      refreshing,
      showFooter,
      isLoading,
    } = this.state;

    const {t, navigation, user} = this.props;

    return (
      <View style={styles.container}>
        <Image source={Images.bannerMyCourse} style={styles.imgBanner} />
        		
		<View style={styles.header}>        
            <View style={styles.header1}>
              <Text style={styles.title}>{t('myCertificates.title')}</Text>
            </View>
         
        </View>
		
        {user?.token ? (
          <>
  
            {isLoading && (
                <View style={{ marginTop: 50, zIndex: 1000 }}>
                  <ActivityIndicator size="small" />
                </View>
              )}

            {!isLoading && !refreshing && data.length === 0 && (
              <Text
                style={[
                  styles.txtFilterItem,
                  {alignSelf: 'center', marginTop: 50},
                ]}>
                {t('dataNotFound')}
              </Text>
            )}

            <ListMyCertificate
              navigation={navigation}
              data={data}
              extraData={this.state}
              style={{marginTop: 20}}
              contentContainerStyle={{paddingBottom: 150}}
              refreshScreen={this.refreshScreen()}
              nextPage={this.handleLoadMore}
              refreshing={refreshing}
              showFooter={showFooter}
            />
            			
          </>	
		
		) : (
			
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily: 'Poppins',
                fontSize: 16,
                marginBottom: 20,
                color: '#444',
              }}>
              {t('needLogin')}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 10,
                border: 1,
                backgroundColor: '#000',
                paddingVertical: 10,
                paddingHorizontal: 30,
                borderRadius: 5,
              }}
              onPress={() => navigation.navigate('LoginScreen')}>
              <Text
                style={{
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  color: '#fff',
                }}>
                {t('login')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
)(withTranslation()(MyCertificate));
