export function consoleLog(...args: any[]) {
  if (__DEV__) {
    console.log(...args);
  }
}

export function consoleDebug(...args: any[]) {
  if (__DEV__) {
    console.debug(args);
  }
}

export function tronLog(...args: any[]) {
  if (__DEV__) {
    // Load reactotron only in dev mode
    const Reactotron = require('reactotron-react-native').default;
    Reactotron.log(args);
  }
}
