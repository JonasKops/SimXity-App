import {Platform, StatusBar} from 'react-native';
import {hasNotch, hasDynamicIsland} from 'react-native-device-info';

let statusBarHeight = 20;

if (Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS) {
  if (hasNotch()) {
    statusBarHeight = 46;
  } else if (hasDynamicIsland()) {
    statusBarHeight = 50;
  } else {
    statusBarHeight = 20;
  }
}

export const isIphoneXFamilly = () => hasNotch() || hasDynamicIsland();

export function ifIphoneX(iphoneXStyle, regularStyle) {
  if (isIphoneXFamilly()) {
    return iphoneXStyle;
  }
  return regularStyle;
}

export function getStatusBarHeight(safe) {
  return Platform.select({
    ios: ifIphoneX(safe ? statusBarHeight : 30, 20),
    android: StatusBar.currentHeight,
    default: 0,
  });
}

export function getBottomSpace() {
  return isIphoneXFamilly() ? 34 : 0;
}
