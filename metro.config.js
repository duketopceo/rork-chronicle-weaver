/**
 * Metro Configuration for Chronicle Weaver
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Simple configuration for web support
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

module.exports = config;
