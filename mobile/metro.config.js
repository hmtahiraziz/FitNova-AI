const path = require('path');
const fs = require('fs');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const baseConfig = mergeConfig(getDefaultConfig(projectRoot), {});

function resolveExistingFile(basePath) {
  const asJs = `${basePath}.js`;
  if (fs.existsSync(asJs) && fs.statSync(asJs).isFile()) {
    return { type: 'sourceFile', filePath: asJs };
  }
  const asIndex = path.join(basePath, 'index.js');
  if (fs.existsSync(asIndex) && fs.statSync(asIndex).isFile()) {
    return { type: 'sourceFile', filePath: asIndex };
  }
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return { type: 'sourceFile', filePath: basePath };
  }
  return null;
}

/** Windows + nested node_modules: Metro sometimes misses @notifee dist relative imports. */
function resolveNotifeeRelative(context, moduleName, platform, next) {
  const origin = context.originModulePath.replace(/\\/g, '/');
  if (
    origin.includes('@notifee/react-native/dist/') &&
    (moduleName.startsWith('./') || moduleName.startsWith('../'))
  ) {
    const absolute = path.resolve(path.dirname(context.originModulePath), moduleName);
    const hit = resolveExistingFile(absolute);
    if (hit) {
      return hit;
    }
  }
  const previous = baseConfig.resolver?.resolveRequest;
  if (previous) {
    return previous(context, moduleName, platform);
  }
  return next(context, moduleName, platform);
}

const config = {
  ...baseConfig,
  resolver: {
    ...baseConfig.resolver,
    resolveRequest(context, moduleName, platform) {
      return resolveNotifeeRelative(
        context,
        moduleName,
        platform,
        context.resolveRequest.bind(context),
      );
    },
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
