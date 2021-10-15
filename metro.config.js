/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const blocklist = require('metro-config/src/defaults/exclusionList');
const { getDefaultConfig } = require('metro-config');
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = (async () => {
  const {
    resolver: { sourceExts },
  } = await getDefaultConfig();
  return {

    transformer: {
      // babelTransformerPath: require.resolve('react-native-typescript-transformer'),
      babelTransformerPath: require.resolve('@bam.tech/react-native-graphql-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    maxWorkers: 2,

    resolver: {
      blocklistRE: blocklist([
        /ios\/Pods\/JitsiMeetSDK\/Frameworks\/JitsiMeet.framework\/assets\/node_modules\/react-native\/.*/
      ]),
      sourceExts: [...sourceExts, 'gql', 'graphql'],
    },
  };
})();


