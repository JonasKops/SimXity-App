import {StyleSheet, Dimensions, Platform} from 'react-native';
import {getStatusBarHeight} from 'app-common';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    // width: deviceWidth,
    height: deviceHeight,
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
  keyboard: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  wrapper: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  viewAvatar: {
    width: deviceWidth - 32,
    height: (250 / 375) * deviceWidth,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    marginBottom: 20,
  },
  txtBtnUpload: {
    fontFamily: 'Poppins',
    fontSize: 14,
    lineHeight: 21,
    color: '#000',
  },
  titleChild: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    fontWeight: '500',
  },
  icon: {
    color: '#D2D2D2',
    fontSize: 17,
  },
  viewInputBio: {
    width: deviceWidth - 32,
    height: 100,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    marginBottom: 16,
  },
  textInputBio: {
    fontFamily: 'Poppins',
    fontSize: 13,
    lineHeight: 19,
    margin: 20,
    marginTop: 15,
    color: '#949494',
    flex: 1,
    textAlignVertical: 'top',
  },
  viewInput: {
    width: deviceWidth - 32,
    height: 42,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  txtInput: {
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    fontFamily: 'Poppins',
    fontSize: 13,
    marginHorizontal: 20,
    color: '#949494',
    flex: 1,
  },
  uploadBtn: {
    backgroundColor: '#FBC815',
    width: 99,
    height: 35,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginBottom: 30,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: '#FBC815',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 14,
  },
});

export default styles;
