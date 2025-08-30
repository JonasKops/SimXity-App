import {StyleSheet, Dimensions, Platform} from 'react-native';
import {getStatusBarHeight} from 'app-common';

const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
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
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 65,
  },
  textWrapper: {
    marginBottom: 14,
  },
  titleChild: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    fontWeight: '500',
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
  btnViewPass: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#FBC815',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 14,
  },
  icon: {
    color: '#D2D2D2',
    fontSize: 18,
  },
});

export default styles;
