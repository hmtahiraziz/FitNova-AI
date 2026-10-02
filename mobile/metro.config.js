const path = require('path');
const fs = require('fs');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;

const defaultConfig = getDefaultConfig(projectRoot);

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

/**
 * Windows + nested node_modules: Metro sometimes misses @notifee dist relative imports.
 * Applied AFTER withNativeWind so CSS (@tailwind) stays on the css-interop transformer.
 */
function withNotifeeResolver(config) {
  const previousResolveRequest = config.resolver?.resolveRequest;

  return {
    ...config,
    resolver: {
      ...config.resolver,
      resolveRequest(context, moduleName, platform) {
        const origin = context.originModulePath.replace(/\\/g, '/');
        if (
          origin.includes('@notifee/react-native/dist/') &&
          (moduleName.startsWith('./') || moduleName.startsWith('../'))
        ) {
          const absolute = path.resolve(
            path.dirname(context.originModulePath),
            moduleName,
          );
          const hit = resolveExistingFile(absolute);
          if (hit) {
            return hit;
          }
        }

        if (previousResolveRequest) {
          return previousResolveRequest(context, moduleName, platform);
        }
        return context.resolveRequest(context, moduleName, platform);
      },
    },
  };
}

const baseConfig = mergeConfig(defaultConfig, {});

// NativeWind first so release bundling does not feed global.css into Babel.
const withCss = withNativeWind(baseConfig, {
  input: path.join(projectRoot, 'global.css'),
});

module.exports = withNotifeeResolver(withCss);
