import {StyleSheet, Dimensions, Platform} from 'react-native';
import {getStatusBarHeight} from 'app-common';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default StyleSheet.create({
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
    fontSize: 24,
  },
  noData: {
    textAlign: 'center',
    paddingTop: 50,
    color: '#A9A9A9',
    fontFamily: 'Poppins',
  },
  wrapper: {
    marginTop: 20,
    marginBottom: 80,
  },
  inner: {
    gap: 10,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 20,
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  textWrapper: {
    marginHorizontal: 20,
  },
  textTitle: {
    fontFamily: 'Poppins',
    fontSize: 15,
    color: '#666666',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
});
