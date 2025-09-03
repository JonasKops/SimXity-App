// Path: src/screens/root.js
import React from 'react';
import {ActivityIndicator, Dimensions, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import AppNavigator from '../navigations';

const {width, height} = Dimensions.get('window');

const App = () => {
  const common = useSelector(state => state.common);

  return (
    // allow touches to reach system overlays (LogBox) and other top-layer UI
    <View style={styles.container} pointerEvents="box-none">
      <AppNavigator />

      {common.loading && (
        // allow touches to pass through so the UI remains interactive even if loading gets stuck
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  overlay: {
    width,
    height,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
