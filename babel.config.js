module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        alias: {
          'app-component': './src/component',
          'app-assets': './src/assets',
          'app-api': './src/api',
          'app-common': './src/common',
          'app-config': './src/config',
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
