// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .lottie as a recognized asset extension for dotLottie files
config.resolver.assetExts.push('lottie');

module.exports = config;
