const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * This adds extraNodeModules mappings for internal packages (app-common, app-api, etc.)
 * and adds the src folder to watchFolders so Metro can resolve those package names
 * to local source folders.
 *
 * @type {import('metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const srcRoot = path.resolve(projectRoot, 'src');

const extraNodeModules = {
  'app-common': path.join(srcRoot, 'common'),
  'app-api': path.join(srcRoot, 'api'),
  'app-config': path.join(srcRoot, 'config'),
  'app-component': path.join(srcRoot, 'component'),
  'app-assets': path.join(srcRoot, 'assets'),
};

const defaultConfig = getDefaultConfig(projectRoot);

const config = mergeConfig(defaultConfig, {
  resolver: {
    extraNodeModules,
    // ensure common extensions like .cjs are recognized
    sourceExts: Array.from(new Set([...(defaultConfig.resolver.sourceExts || []), 'cjs'])),
  },
  watchFolders: [srcRoot],
});

module.exports = config;
