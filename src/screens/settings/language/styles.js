import {StyleSheet, Dimensions, Platform} from 'react-native';
import {getStatusBarHeight} from 'app-common';

const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    position: 'relative',
  },
  imgBanner: {
    width: (276 / 375) * deviceWidth,
    height: (209 / 375) * deviceWidth,
    resizeMode: 'contain',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: -1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
    marginTop: 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: 24,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
    marginVertical: 20,
  },
  touchLang: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textLang: {
    flex: 1,
    paddingRight: 10,
    fontFamily: 'Poppins',
    fontSize: 15,
  },
  icon: {
    fontSize: 20,
    color: '#FBC815',
  },
  updateContainer: {
    width: deviceWidth,
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
  },
  updateBtn: {
    backgroundColor: '#FBC815',
    height: 50,
    borderRadius: 8,
    width: deviceWidth * 0.9,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: {
    fontSize: 16,
    lineHeight: 35,
    color: '#000000',
    fontFamily: 'Poppins-Medium',
  },
});

export default styles;
