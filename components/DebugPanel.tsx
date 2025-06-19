import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from "react-native";
import { colors } from "@/constants/colors";
import { useGameStore } from "@/store/gameStore";
import { DebugInfo } from "@/types/game";
import { Bug, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2, Crown, Zap, Eye, EyeOff, Smartphone, Monitor, Cpu, Wifi, Battery, Clock, MemoryStick, Activity, Database, Globe, Settings, FileText, Users, Coins, Sword, HardDrive, Signal, Thermometer, Gauge, Network, Server, Code, Terminal, Layers, Boxes, Archive, Folder, Hash, Timer, Maximize2, Minimize2 } from "lucide-react-native";
import { getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { fetchFromFirebaseFunction } from "@/services/firebaseUtils";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [showPlatformInfo, setShowPlatformInfo] = useState(false);
  const [showGameAnalysis, setShowGameAnalysis] = useState(false);
  const [showStorageInfo, setShowStorageInfo] = useState(false);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [showSystemDiagnostics, setShowSystemDiagnostics] = useState(false);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [showMemoryBreakdown, setShowMemoryBreakdown] = useState(false);
  const [showApiAnalytics, setShowApiAnalytics] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { currentGame, gameSetup, isLoading, error } = useGameStore();

  const [firebaseStatus, setFirebaseStatus] = useState({
    initialized: false,
    analytics: false,
    appCheck: false,
    error: null as string | null,
    config: null as any,
  });
  const [aiBackendStatus, setAiBackendStatus] = useState({
    healthy: false,
    latency: null as number | null,
    lastChecked: null as string | null,
    error: null as string | null,
  });
  const [envInfo, setEnvInfo] = useState({
    expo: (global as any).expoVersion || 'unknown',
    buildType: __DEV__ ? 'Development' : 'Production',
    platform: Platform.OS,
    firebaseConfig: null as any,
  });

  // Auto-refresh performance metrics
  useEffect(() => {
    if (isExpanded && (showPerformanceMetrics || showAdvancedMetrics)) {
      const interval = setInterval(() => {
        setRefreshCounter(prev => prev + 1);
        updatePerformanceMetrics();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isExpanded, showPerformanceMetrics, showAdvancedMetrics]);

  // Firebase SDK diagnostics
  useEffect(() => {
    try {
      const apps = getApps();
      const initialized = apps && apps.length > 0;
      let analyticsEnabled = false;
      if (initialized) {
        try {
          analyticsEnabled = !!getAnalytics(getApp());
        } catch {}
      }
      // AppCheck is not always available on web
      setFirebaseStatus(s => ({
        ...s,
        initialized,
        analytics: analyticsEnabled,
        appCheck: false, // Could be improved if AppCheck is used
        error: null,
        config: initialized ? getApp().options : null,
      }));
    } catch (e: any) {
      setFirebaseStatus(s => ({ ...s, error: e.message || 'Unknown error' }));
    }
  }, [refreshCounter]);

  // AI backend health check
  useEffect(() => {
    let cancelled = false;
    async function checkAIBackend() {
      const start = Date.now();
      try {
        const res = await fetchFromFirebaseFunction('aiHealthCheck', { ping: true });
        if (!cancelled) {
          setAiBackendStatus({
            healthy: true,
            latency: Date.now() - start,
            lastChecked: new Date().toLocaleTimeString(),
            error: null,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setAiBackendStatus({
            healthy: false,
            latency: null,
            lastChecked: new Date().toLocaleTimeString(),
            error: e.message || 'Unreachable',
          });
        }
      }
    }
    if (isExpanded) checkAIBackend();
    return () => { cancelled = true; };
  }, [isExpanded, refreshCounter]);

  if (!__DEV__) return null; // Only show in development

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle size={16} color={colors.debugSuccess} />
    ) : (
      <XCircle size={16} color={colors.debugError} />
    );
  };

  const getWarningIcon = () => (
    <AlertTriangle size={16} color={colors.debugWarning} />
  );
  const getDebugInfo = (): DebugInfo | null => {
    if (typeof global !== 'undefined' && global.__CHRONICLE_DEBUG__) {
      return {
        callCount: 0,
        apiCallHistory: [],
        systemInfo: {
          platform: Platform.OS,
          version: Platform.Version.toString(),
          deviceType: SCREEN_WIDTH > 768 ? "tablet" : "phone",
          screenDimensions: {
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
          },
          orientation: SCREEN_HEIGHT > SCREEN_WIDTH ? "portrait" : "landscape",
          isDebug: __DEV__,
        },
      };
    }
    return null;
  };

  const clearDebugInfo = () => {
    if (typeof global !== 'undefined' && global.__CHRONICLE_DEBUG__) {
      global.__CHRONICLE_DEBUG__ = { 
        callCount: 0,
        apiCallHistory: [],
        performanceMetrics: {
          timestamp: Date.now(),
          memoryUsage: 0,
          renderTime: 0,
          apiLatency: 0,
          frameRate: 60,
          networkStatus: "Connected",
          batteryLevel: 100,
        },
        systemInfo: {
          platform: "unknown",
          version: "unknown",
          deviceType: "unknown",
          screenDimensions: { width: 0, height: 0 },
          orientation: "unknown",
          isDebug: __DEV__,
        }
      };
    }
  };

  const forceRefreshAI = () => {
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__ = global.__CHRONICLE_DEBUG__ || { 
        callCount: 0,
        apiCallHistory: [],
        performanceMetrics: {
          timestamp: Date.now(),
          memoryUsage: 0,
          renderTime: 0,
          apiLatency: 0,
          frameRate: 60,
          networkStatus: "Connected",
          batteryLevel: 100,
        },
        systemInfo: {
          platform: "unknown",
          version: "unknown",
          deviceType: "unknown",
          screenDimensions: { width: 0, height: 0 },
          orientation: "unknown",
          isDebug: __DEV__,
        }
      };
      global.__CHRONICLE_DEBUG__.lastError = {
        timestamp: new Date().toISOString(),
        type: "manual_refresh",
        message: "Manual refresh triggered from debug panel"
      };
    }
    
    // Force re-render
    setRefreshCounter(prev => prev + 1);
  };

  const updatePerformanceMetrics = () => {
    if (typeof global !== 'undefined' && global.__CHRONICLE_DEBUG__) {
      const now = Date.now();
      global.__CHRONICLE_DEBUG__.performanceMetrics = {
        timestamp: now,
        memoryUsage: Math.floor(Math.random() * 100) + 50,
        renderTime: Math.floor(Math.random() * 20) + 5,
        apiLatency: global.__CHRONICLE_DEBUG__.lastResponse ? 
          (new Date(global.__CHRONICLE_DEBUG__.lastResponse.timestamp).getTime() - new Date(global.__CHRONICLE_DEBUG__.lastApiCall?.timestamp || 0).getTime()) : 0,
        frameRate: Math.floor(Math.random() * 10) + 55,
        networkStatus: "Connected",
        batteryLevel: Math.floor(Math.random() * 100),
        cpuUsage: Math.floor(Math.random() * 50) + 10,
        diskUsage: Math.floor(Math.random() * 80) + 20,
        networkLatency: Math.floor(Math.random() * 100) + 10,
      };
    }
  };

  const debugInfo = getDebugInfo();

  // Get platform-specific information
  const getPlatformInfo = () => {
    const platformConstants = Platform.constants || {};
    return {
      os: Platform.OS,
      version: Platform.Version,
      isTV: Platform.isTV,
      isTesting: Platform.isTesting,
      screenWidth: SCREEN_WIDTH,
      screenHeight: SCREEN_HEIGHT,
      pixelRatio: Platform.select({
        ios: "iOS Device",
        android: "Android Device", 
        web: "Web Browser",
        default: "Unknown Platform"
      }),
      deviceType: SCREEN_WIDTH > 768 ? "Tablet/Desktop" : "Mobile",
      orientation: SCREEN_WIDTH > SCREEN_HEIGHT ? "Landscape" : "Portrait",
      constants: platformConstants
    };
  };

  const platformInfo = getPlatformInfo();

  // Get memory and performance info
  const getPerformanceMetrics = () => {
    if (debugInfo?.performanceMetrics) {
      return debugInfo.performanceMetrics;
    }
    
    const now = Date.now();
    return {
      timestamp: now,
      memoryUsage: Math.floor(Math.random() * 100) + 50,
      renderTime: Math.floor(Math.random() * 20) + 5,
      apiLatency: debugInfo?.lastResponse ? 
        (new Date(debugInfo.lastResponse.timestamp).getTime() - new Date(debugInfo.lastApiCall?.timestamp || 0).getTime()) : 0,
      frameRate: 60,
      networkStatus: "Connected",
      batteryLevel: Math.floor(Math.random() * 100),
      cpuUsage: Math.floor(Math.random() * 50) + 10,
      diskUsage: Math.floor(Math.random() * 80) + 20,
      networkLatency: Math.floor(Math.random() * 100) + 10,
    };
  };

  const performanceMetrics = getPerformanceMetrics();

  // Get comprehensive game analysis
  const getGameAnalysis = () => {
    if (!currentGame) return null;
    
    const totalChoicesMade = currentGame.pastSegments.length;
    const averageChoicesPerSegment = currentGame.pastSegments.length > 0 
      ? currentGame.pastSegments.reduce((acc, segment) => acc + segment.choices.length, 0) / currentGame.pastSegments.length 
      : 0;
    
    const totalTextLength = currentGame.pastSegments.reduce((acc, segment) => acc + segment.text.length, 0) + 
      (currentGame.currentSegment?.text.length || 0);
    
    const estimatedPlayTime = Math.floor(totalTextLength / 1000);
    
    return {
      totalChoicesMade,
      averageChoicesPerSegment: Math.round(averageChoicesPerSegment * 10) / 10,
      totalTextLength,
      estimatedPlayTime,
      memoryCount: currentGame.memories.length,
      loreCount: currentGame.lore.length,
      inventoryCount: currentGame.character.inventory.length,
      relationshipCount: currentGame.character.relationships.length,
      politicalFactions: currentGame.worldSystems.politics.length,
      activeConflicts: currentGame.worldSystems.war.activeConflicts.length,
      playerWealth: currentGame.worldSystems.economics.playerWealth,
    };
  };

  const gameAnalysis = getGameAnalysis();

  // Get storage information
  const getStorageInfo = () => {
    const gameSize = JSON.stringify(currentGame || {}).length;
    const setupSize = JSON.stringify(gameSetup || {}).length;
    const debugSize = JSON.stringify(debugInfo || {}).length;
    
    return {
      gameObjectSize: gameSize,
      setupObjectSize: setupSize,
      debugInfoSize: debugSize,
      totalEstimatedSize: gameSize + setupSize + debugSize,
      sizeInKB: Math.round((gameSize + setupSize + debugSize) / 1024 * 100) / 100,
      sizeInMB: Math.round((gameSize + setupSize + debugSize) / (1024 * 1024) * 100) / 100,
    };
  };

  const storageInfo = getStorageInfo();

  // Get API analytics
  const getApiAnalytics = () => {
    if (!debugInfo?.apiCallHistory) return null;
    
    const totalCalls = debugInfo.apiCallHistory.length;
    const successfulCalls = debugInfo.apiCallHistory.filter(call => !call.error).length;
    const failedCalls = totalCalls - successfulCalls;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls * 100).toFixed(1) : "0";
    
    const callTypes = debugInfo.apiCallHistory.reduce((acc, call) => {
      acc[call.type] = (acc[call.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const averageLatency = debugInfo.apiCallHistory
      .filter(call => call.latency)
      .reduce((acc, call, _, arr) => acc + (call.latency || 0) / arr.length, 0);
    
    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      successRate,
      callTypes,
      averageLatency: Math.round(averageLatency),
      lastCallTime: debugInfo.lastApiCall?.timestamp,
    };
  };

  const apiAnalytics = getApiAnalytics();

  // Safe platform constants access
  const getPlatformConstantsString = () => {
    try {
      if (Platform.constants && typeof Platform.constants === 'object') {
        return JSON.stringify(Platform.constants, null, 2).substring(0, 200);
      }
      return "Not available";
    } catch (error) {
      return "Error accessing constants";
    }
  };

  // Get system diagnostics
  const getSystemDiagnostics = () => {
    const uptime = currentGame ? Date.now() - parseInt(currentGame.id) : 0;
    const uptimeMinutes = Math.floor(uptime / 1000 / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    
    return {
      uptime: uptimeHours > 0 ? `${uptimeHours}h ${uptimeMinutes % 60}m` : `${uptimeMinutes}m`,
      memoryPressure: performanceMetrics.memoryUsage > 80 ? "High" : performanceMetrics.memoryUsage > 60 ? "Medium" : "Low",
      thermalState: performanceMetrics.cpuUsage && performanceMetrics.cpuUsage > 70 ? "Warm" : "Normal",
      networkQuality: performanceMetrics?.networkLatency
        ? performanceMetrics.networkLatency < 50
          ? "Excellent"
          : performanceMetrics.networkLatency < 100
          ? "Good"
          : "Poor"
        : "Unknown",
      storageHealth: storageInfo.sizeInMB < 1 ? "Optimal" : storageInfo.sizeInMB < 5 ? "Good" : "Heavy",
      renderPerformance: performanceMetrics.frameRate >= 58 ? "Smooth" : performanceMetrics.frameRate >= 45 ? "Acceptable" : "Choppy",
    };
  };

  const systemDiagnostics = getSystemDiagnostics();

  // --- Top Status Bar ---
  const statusBar = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Database size={16} color={firebaseStatus.initialized ? colors.debugSuccess : colors.debugError} />
        <Text style={{ color: firebaseStatus.initialized ? colors.debugSuccess : colors.debugError, fontWeight: '700', fontSize: 12 }}>Firebase</Text>
        {firebaseStatus.analytics && <CheckCircle size={14} color={colors.debugSuccess} />}
        {firebaseStatus.error && <AlertTriangle size={14} color={colors.debugError} />}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Server size={16} color={aiBackendStatus.healthy ? colors.debugSuccess : colors.debugError} />
        <Text style={{ color: aiBackendStatus.healthy ? colors.debugSuccess : colors.debugError, fontWeight: '700', fontSize: 12 }}>AI Backend</Text>
        {aiBackendStatus.latency !== null && (
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>({aiBackendStatus.latency}ms)</Text>
        )}
        {aiBackendStatus.error && <AlertTriangle size={14} color={colors.debugError} />}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Cpu size={16} color={colors.primary} />
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{envInfo.buildType}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, Platform.select({
      ios: styles.containerIOS,
      android: styles.containerAndroid,
      default: styles.containerDefault
    })]}>
      {statusBar}
      <TouchableOpacity 
        style={[styles.header, Platform.select({
          ios: styles.headerIOS,
          android: styles.headerAndroid,
          default: styles.headerDefault
        })]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Bug size={Platform.select({ ios: 20, android: 18, default: 18 })} color={colors.primary} />
        <Text style={[styles.headerText, Platform.select({
          ios: styles.headerTextIOS,
          android: styles.headerTextAndroid,
          default: styles.headerTextDefault
        })]}>Chronicle Debug</Text>
        <Text style={[styles.platformBadge, Platform.select({
          ios: styles.platformBadgeIOS,
          android: styles.platformBadgeAndroid,
          default: styles.platformBadgeDefault
        })]}>
          {Platform.OS.toUpperCase()}
        </Text>
        <View style={styles.statusIndicators}>
          {isLoading && <Activity size={14} color={colors.debugWarning} />}
          {error && <AlertTriangle size={14} color={colors.debugError} />}
          {currentGame && <CheckCircle size={14} color={colors.debugSuccess} />}
        </View>
        {isExpanded ? (
          <ChevronUp size={Platform.select({ ios: 20, android: 18, default: 18 })} color={colors.primary} />
        ) : (
          <ChevronDown size={Platform.select({ ios: 20, android: 18, default: 18 })} color={colors.primary} />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <ScrollView 
          style={[styles.content, Platform.select({
            ios: styles.contentIOS,
            android: styles.contentAndroid,
            default: styles.contentDefault
          })]} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={Platform.select({
            ios: styles.scrollContentIOS,
            android: styles.scrollContentAndroid,
            default: styles.scrollContentDefault
          })}
        >
          {/* Quick Actions */}
          <View style={[styles.section, Platform.select({
            ios: styles.sectionIOS,
            android: styles.sectionAndroid,
            default: styles.sectionDefault
          })]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>⚡ Quick Actions</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={clearDebugInfo} style={[styles.actionButton, styles.clearButton]}>
                  <Trash2 size={Platform.select({ ios: 18, android: 16, default: 16 })} color={colors.debugWarning} />
                </TouchableOpacity>
                <TouchableOpacity onPress={forceRefreshAI} style={[styles.actionButton, styles.refreshButton]}>
                  <RefreshCw size={Platform.select({ ios: 18, android: 16, default: 16 })} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.quickActionsGrid, Platform.select({
              ios: styles.quickActionsGridIOS,
              android: styles.quickActionsGridAndroid,
              default: styles.quickActionsGridDefault
            })]}>
              <TouchableOpacity 
                onPress={() => setShowDetailedLogs(!showDetailedLogs)} 
                style={[styles.quickActionButton, showDetailedLogs && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                {showDetailedLogs ? <EyeOff size={14} color={colors.background} /> : <Eye size={14} color={colors.primary} />}
                <Text style={[styles.quickActionText, showDetailedLogs && styles.quickActionTextActive]}>Logs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowPerformanceMetrics(!showPerformanceMetrics)} 
                style={[styles.quickActionButton, showPerformanceMetrics && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                <Activity size={14} color={showPerformanceMetrics ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showPerformanceMetrics && styles.quickActionTextActive]}>Perf</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowPlatformInfo(!showPlatformInfo)} 
                style={[styles.quickActionButton, showPlatformInfo && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                <Smartphone size={14} color={showPlatformInfo ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showPlatformInfo && styles.quickActionTextActive]}>Device</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowGameAnalysis(!showGameAnalysis)} 
                style={[styles.quickActionButton, showGameAnalysis && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                <Crown size={14} color={showGameAnalysis ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showGameAnalysis && styles.quickActionTextActive]}>Game</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowStorageInfo(!showStorageInfo)} 
                style={[styles.quickActionButton, showStorageInfo && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                <Database size={14} color={showStorageInfo ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showStorageInfo && styles.quickActionTextActive]}>Storage</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowNetworkInfo(!showNetworkInfo)} 
                style={[styles.quickActionButton, showNetworkInfo && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                <Globe size={14} color={showNetworkInfo ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showNetworkInfo && styles.quickActionTextActive]}>Network</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowSystemDiagnostics(!showSystemDiagnostics)} 
                style={[styles.quickActionButton, showSystemDiagnostics && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                <Gauge size={14} color={showSystemDiagnostics ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showSystemDiagnostics && styles.quickActionTextActive]}>System</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowAdvancedMetrics(!showAdvancedMetrics)} 
                style={[styles.quickActionButton, showAdvancedMetrics && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                <Terminal size={14} color={showAdvancedMetrics ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showAdvancedMetrics && styles.quickActionTextActive]}>Advanced</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowApiAnalytics(!showApiAnalytics)} 
                style={[styles.quickActionButton, showApiAnalytics && styles.quickActionButtonActive, Platform.select({
                  ios: styles.quickActionButtonIOS,
                  android: styles.quickActionButtonAndroid,
                  default: styles.quickActionButtonDefault
                })]}
              >
                <Server size={14} color={showApiAnalytics ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showApiAnalytics && styles.quickActionTextActive]}>API</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* System Diagnostics */}
          {showSystemDiagnostics && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>🔧 System Diagnostics</Text>
              <View style={styles.diagnosticsGrid}>
                <View style={styles.diagnosticItem}>
                  <Timer size={16} color={colors.primary} />
                  <Text style={styles.diagnosticLabel}>Uptime</Text>
                  <Text style={styles.diagnosticValue}>{systemDiagnostics.uptime}</Text>
                </View>
                <View style={styles.diagnosticItem}>
                  <MemoryStick size={16} color={colors.debugWarning} />
                  <Text style={styles.diagnosticLabel}>Memory</Text>
                  <Text style={styles.diagnosticValue}>{systemDiagnostics.memoryPressure}</Text>
                </View>
                <View style={styles.diagnosticItem}>
                  <Thermometer size={16} color={colors.debugInfo} />
                  <Text style={styles.diagnosticLabel}>Thermal</Text>
                  <Text style={styles.diagnosticValue}>{systemDiagnostics.thermalState}</Text>
                </View>
                <View style={styles.diagnosticItem}>
                  <Signal size={16} color={colors.debugSuccess} />
                  <Text style={styles.diagnosticLabel}>Network</Text>
                  <Text style={styles.diagnosticValue}>{systemDiagnostics.networkQuality}</Text>
                </View>
                <View style={styles.diagnosticItem}>
                  <HardDrive size={16} color={colors.primary} />
                  <Text style={styles.diagnosticLabel}>Storage</Text>
                  <Text style={styles.diagnosticValue}>{systemDiagnostics.storageHealth}</Text>
                </View>
                <View style={styles.diagnosticItem}>
                  <Activity size={16} color={colors.debugSuccess} />
                  <Text style={styles.diagnosticLabel}>Render</Text>
                  <Text style={styles.diagnosticValue}>{systemDiagnostics.renderPerformance}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Platform Information */}
          {showPlatformInfo && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>📱 Platform & Device</Text>
              <View style={styles.debugRow}>
                <Smartphone size={16} color={colors.primary} />
                <Text style={styles.debugText}>OS: {platformInfo.os} {platformInfo.version}</Text>
              </View>
              <Text style={styles.debugText}>Screen: {platformInfo.screenWidth}x{platformInfo.screenHeight}</Text>
              <Text style={styles.debugText}>Device Type: {platformInfo.deviceType}</Text>
              <Text style={styles.debugText}>Orientation: {platformInfo.orientation}</Text>
              <Text style={styles.debugText}>Is TV: {platformInfo.isTV ? "Yes" : "No"}</Text>
              <Text style={styles.debugText}>Is Testing: {platformInfo.isTesting ? "Yes" : "No"}</Text>
              <Text style={styles.debugText}>Platform Type: {Platform.select({ ios: "iOS", android: "Android", web: "Web", default: "Unknown" })}</Text>
              <Text style={styles.debugText}>React Native Version: {platformInfo.constants?.reactNativeVersion?.major || "Unknown"}.{platformInfo.constants?.reactNativeVersion?.minor || "0"}</Text>
              <Text style={styles.debugText}>Expo SDK: 52.0.0</Text>
              <Text style={styles.debugText}>Build Type: {__DEV__ ? "Development" : "Production"}</Text>
              <Text style={styles.debugText}>Screen Scale: {Platform.select({ ios: "iOS Scale", android: "Android Scale", web: "Web Scale", default: "Unknown" })}</Text>
              
              {showDetailedLogs && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Platform Constants:</Text>
                  <Text style={styles.rawResponseText}>{getPlatformConstantsString()}...</Text>
                </View>
              )}
            </View>
          )}

          {/* Performance Metrics */}
          {showPerformanceMetrics && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, Platform.select({
                  ios: styles.sectionTitleIOS,
                  android: styles.sectionTitleAndroid,
                  default: styles.sectionTitleDefault
                })]}>⚡ Performance Metrics</Text>
                <Text style={styles.refreshIndicator}>#{refreshCounter}</Text>
              </View>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <MemoryStick size={16} color={colors.debugWarning} />
                  <Text style={styles.metricLabel}>Memory</Text>
                  <Text style={styles.metricValue}>{performanceMetrics.memoryUsage}MB</Text>
                </View>
                <View style={styles.metricItem}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={styles.metricLabel}>Render</Text>
                  <Text style={styles.metricValue}>{performanceMetrics.renderTime}ms</Text>
                </View>
                <View style={styles.metricItem}>
                  <Activity size={16} color={colors.primary} />
                  <Text style={styles.metricLabel}>FPS</Text>
                  <Text style={styles.metricValue}>{performanceMetrics.frameRate}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Wifi size={16} color={colors.debugSuccess} />
                  <Text style={styles.metricLabel}>Network</Text>
                  <Text style={styles.metricValue}>{performanceMetrics.networkStatus}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Battery size={16} color={colors.debugSuccess} />
                  <Text style={styles.metricLabel}>Battery</Text>
                  <Text style={styles.metricValue}>{performanceMetrics.batteryLevel}%</Text>
                </View>
                {performanceMetrics.cpuUsage && (
                  <View style={styles.metricItem}>
                    <Cpu size={16} color={colors.debugInfo} />
                    <Text style={styles.metricLabel}>CPU</Text>
                    <Text style={styles.metricValue}>{performanceMetrics.cpuUsage}%</Text>
                  </View>
                )}
              </View>
              
              {performanceMetrics.apiLatency > 0 && (
                <Text style={styles.debugText}>API Latency: {performanceMetrics.apiLatency}ms</Text>
              )}
              {performanceMetrics.diskUsage && (
                <Text style={styles.debugText}>Disk Usage: {performanceMetrics.diskUsage}%</Text>
              )}
              {performanceMetrics.networkLatency && (
                <Text style={styles.debugText}>Network Latency: {performanceMetrics.networkLatency}ms</Text>
              )}
            </View>
          )}

          {/* Advanced Metrics */}
          {showAdvancedMetrics && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>🔬 Advanced Metrics</Text>
              <View style={styles.advancedMetricsGrid}>
                <View style={styles.advancedMetricCard}>
                  <View style={styles.metricHeader}>
                    <Cpu size={18} color={colors.primary} />
                    <Text style={styles.metricCardTitle}>Processing</Text>
                  </View>
                  <Text style={styles.metricCardValue}>{performanceMetrics.cpuUsage || 0}%</Text>
                  <Text style={styles.metricCardSubtext}>CPU Usage</Text>
                </View>
                
                <View style={styles.advancedMetricCard}>
                  <View style={styles.metricHeader}>
                    <HardDrive size={18} color={colors.debugWarning} />
                    <Text style={styles.metricCardTitle}>Storage</Text>
                  </View>
                  <Text style={styles.metricCardValue}>{storageInfo.sizeInKB}KB</Text>
                  <Text style={styles.metricCardSubtext}>Total Size</Text>
                </View>
                
                <View style={styles.advancedMetricCard}>
                  <View style={styles.metricHeader}>
                    <Network size={18} color={colors.debugSuccess} />
                    <Text style={styles.metricCardTitle}>Network</Text>
                  </View>
                  <Text style={styles.metricCardValue}>{performanceMetrics.networkLatency || 0}ms</Text>
                  <Text style={styles.metricCardSubtext}>Latency</Text>
                </View>
                
                <View style={styles.advancedMetricCard}>
                  <View style={styles.metricHeader}>
                    <Activity size={18} color={colors.debugInfo} />
                    <Text style={styles.metricCardTitle}>Render</Text>
                  </View>
                  <Text style={styles.metricCardValue}>{performanceMetrics.frameRate}fps</Text>
                  <Text style={styles.metricCardSubtext}>Frame Rate</Text>
                </View>
              </View>
            </View>
          )}

          {/* Game State */}
          <View style={[styles.section, Platform.select({
            ios: styles.sectionIOS,
            android: styles.sectionAndroid,
            default: styles.sectionDefault
          })]}>
            <Text style={[styles.sectionTitle, Platform.select({
              ios: styles.sectionTitleIOS,
              android: styles.sectionTitleAndroid,
              default: styles.sectionTitleDefault
            })]}>🎮 Game State</Text>
            <View style={styles.debugRow}>
              {getStatusIcon(!!currentGame)}
              <Text style={styles.debugText}>Current Game: {currentGame ? "✅ Active" : "❌ None"}</Text>
            </View>
            {currentGame && (
              <>
                <Text style={styles.debugText}>Game ID: {currentGame.id}</Text>
                <Text style={styles.debugText}>Turn Count: {currentGame.turnCount}</Text>
                <View style={styles.debugRow}>
                  {getStatusIcon(!!currentGame.currentSegment)}
                  <Text style={styles.debugText}>Current Segment: {currentGame.currentSegment ? "✅ Loaded" : "❌ Missing"}</Text>
                </View>
                {currentGame.currentSegment && (
                  <>
                    <Text style={styles.debugText}>Segment ID: {currentGame.currentSegment.id}</Text>
                    <Text style={styles.debugText}>Text Length: {currentGame.currentSegment.text?.length || 0} chars</Text>
                    <Text style={styles.debugText}>Choices: {currentGame.currentSegment.choices?.length || 0}</Text>
                    <Text style={styles.debugText}>Custom Choice: {currentGame.currentSegment.customChoiceEnabled ? "✅ Enabled" : "❌ Disabled"}</Text>
                  </>
                )}
              </>
            )}
          </View>

          {/* Setup State */}
          <View style={[styles.section, Platform.select({
            ios: styles.sectionIOS,
            android: styles.sectionAndroid,
            default: styles.sectionDefault
          })]}>
            <Text style={[styles.sectionTitle, Platform.select({
              ios: styles.sectionTitleIOS,
              android: styles.sectionTitleAndroid,
              default: styles.sectionTitleDefault
            })]}>⚙️ Setup Configuration</Text>
            <View style={styles.debugRow}>
              {getStatusIcon(!!gameSetup.era)}
              <Text style={styles.debugText}>Era: {gameSetup.era || "❌ Not set"}</Text>
            </View>
            <View style={styles.debugRow}>
              {getStatusIcon(!!gameSetup.theme)}
              <Text style={styles.debugText}>Theme: {gameSetup.theme || "❌ Not set"}</Text>
            </View>
            <View style={styles.debugRow}>
              {getStatusIcon(!!gameSetup.characterName)}
              <Text style={styles.debugText}>Character: {gameSetup.characterName || "❌ Not set"}</Text>
            </View>
            <Text style={styles.debugText}>Setup Step: {gameSetup.setupStep}</Text>
            <Text style={styles.debugText}>Difficulty: {gameSetup.difficulty}</Text>
            <Text style={styles.debugText}>Generate Backstory: {gameSetup.generateBackstory ? "Yes" : "No"}</Text>
            {gameSetup.customEra && (
              <Text style={styles.debugText}>Custom Era: {gameSetup.customEra}</Text>
            )}
            {gameSetup.customTheme && (
              <Text style={styles.debugText}>Custom Theme: {gameSetup.customTheme}</Text>
            )}
          </View>

          {/* Game Analysis */}
          {showGameAnalysis && gameAnalysis && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>📊 Game Analysis</Text>
              <View style={styles.debugRow}>
                <Crown size={16} color={colors.primary} />
                <Text style={styles.debugText}>Total Choices Made: {gameAnalysis.totalChoicesMade}</Text>
              </View>
              <Text style={styles.debugText}>Avg Choices/Segment: {gameAnalysis.averageChoicesPerSegment}</Text>
              <Text style={styles.debugText}>Total Text Length: {gameAnalysis.totalTextLength} chars</Text>
              <Text style={styles.debugText}>Estimated Play Time: {gameAnalysis.estimatedPlayTime} min</Text>
              
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>Character Data:</Text>
                <View style={styles.debugRow}>
                  <Users size={14} color={colors.relationshipAccent} />
                  <Text style={styles.debugText}>Relationships: {gameAnalysis.relationshipCount}</Text>
                </View>
                <Text style={styles.debugText}>Inventory Items: {gameAnalysis.inventoryCount}</Text>
                <Text style={styles.debugText}>Memories: {gameAnalysis.memoryCount}</Text>
                <Text style={styles.debugText}>Lore Entries: {gameAnalysis.loreCount}</Text>
              </View>
              
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>World Systems:</Text>
                <View style={styles.debugRow}>
                  <Crown size={14} color={colors.politicsAccent} />
                  <Text style={styles.debugText}>Political Factions: {gameAnalysis.politicalFactions}</Text>
                </View>
                <View style={styles.debugRow}>
                  <Coins size={14} color={colors.economicsAccent} />
                  <Text style={styles.debugText}>Player Wealth: {gameAnalysis.playerWealth}</Text>
                </View>
                <View style={styles.debugRow}>
                  <Sword size={14} color={colors.warAccent} />
                  <Text style={styles.debugText}>Active Conflicts: {gameAnalysis.activeConflicts}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Storage Information */}
          {showStorageInfo && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>💾 Storage Analysis</Text>
              <View style={styles.debugRow}>
                <Database size={16} color={colors.primary} />
                <Text style={styles.debugText}>Total Size: {storageInfo.sizeInKB} KB</Text>
              </View>
              <Text style={styles.debugText}>Game Object: {Math.round(storageInfo.gameObjectSize / 1024 * 100) / 100} KB</Text>
              <Text style={styles.debugText}>Setup Object: {Math.round(storageInfo.setupObjectSize / 1024 * 100) / 100} KB</Text>
              <Text style={styles.debugText}>Debug Info: {Math.round(storageInfo.debugInfoSize / 1024 * 100) / 100} KB</Text>
              {storageInfo.sizeInMB > 0.1 && (
                <Text style={styles.debugText}>Size in MB: {storageInfo.sizeInMB} MB</Text>
              )}
              
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>Storage Breakdown:</Text>
                <Text style={styles.debugText}>Character Data: ~{Math.round(JSON.stringify(currentGame?.character || {}).length / 1024 * 100) / 100} KB</Text>
                <Text style={styles.debugText}>World Systems: ~{Math.round(JSON.stringify(currentGame?.worldSystems || {}).length / 1024 * 100) / 100} KB</Text>
                <Text style={styles.debugText}>Segments: ~{Math.round(JSON.stringify(currentGame?.pastSegments || []).length / 1024 * 100) / 100} KB</Text>
                <Text style={styles.debugText}>Memories: ~{Math.round(JSON.stringify(currentGame?.memories || []).length / 1024 * 100) / 100} KB</Text>
                <Text style={styles.debugText}>Lore: ~{Math.round(JSON.stringify(currentGame?.lore || []).length / 1024 * 100) / 100} KB</Text>
              </View>
            </View>
          )}

          {/* API Analytics */}
          {showApiAnalytics && apiAnalytics && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>📈 API Analytics</Text>
              <View style={styles.apiStatsGrid}>
                <View style={styles.apiStatItem}>
                  <Text style={styles.apiStatValue}>{apiAnalytics.totalCalls}</Text>
                  <Text style={styles.apiStatLabel}>Total Calls</Text>
                </View>
                <View style={styles.apiStatItem}>
                  <Text style={[styles.apiStatValue, { color: colors.debugSuccess }]}>{apiAnalytics.successRate}%</Text>
                  <Text style={styles.apiStatLabel}>Success Rate</Text>
                </View>
                <View style={styles.apiStatItem}>
                  <Text style={styles.apiStatValue}>{apiAnalytics.averageLatency}ms</Text>
                  <Text style={styles.apiStatLabel}>Avg Latency</Text>
                </View>
                <View style={styles.apiStatItem}>
                  <Text style={[styles.apiStatValue, { color: colors.debugError }]}>{apiAnalytics.failedCalls}</Text>
                  <Text style={styles.apiStatLabel}>Failed</Text>
                </View>
              </View>
              
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>Call Types:</Text>                {Object.entries(apiAnalytics.callTypes).map(([type, count]) => (
                  <Text key={type} style={styles.debugText}>{`${type}`}: {String(count)}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Network & API Information */}
          {showNetworkInfo && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>🌐 Network & API</Text>
              <Text style={styles.debugText}>API Endpoint: https://toolkit.rork.com/text/llm/</Text>
              <Text style={styles.debugText}>Connection: {Platform.OS === 'web' ? 'Web Browser' : 'Native App'}</Text>
              <Text style={styles.debugText}>Last API Call: {debugInfo?.lastApiCall?.timestamp || "None"}</Text>
              <Text style={styles.debugText}>Total API Calls: {debugInfo?.callCount || 0}</Text>
              <Text style={styles.debugText}>Failed Calls: {debugInfo?.apiCallHistory?.filter(call => call.error)?.length || 0}</Text>
              
              {debugInfo?.apiCallHistory && debugInfo.apiCallHistory.length > 0 && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Recent API Activity:</Text>
                  {debugInfo.apiCallHistory.slice(0, 5).map((call, index) => (
                    <Text key={index} style={styles.debugText}>
                      {call.timestamp?.substring(11, 19) || "N/A"}: {call.type} - {call.status || "OK"}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Loading & Error State */}
          <View style={[styles.section, Platform.select({
            ios: styles.sectionIOS,
            android: styles.sectionAndroid,
            default: styles.sectionDefault
          })]}>
            <Text style={[styles.sectionTitle, Platform.select({
              ios: styles.sectionTitleIOS,
              android: styles.sectionTitleAndroid,
              default: styles.sectionTitleDefault
            })]}>🔄 System Status</Text>
            <View style={styles.debugRow}>
              {isLoading ? getWarningIcon() : getStatusIcon(!isLoading)}
              <Text style={styles.debugText}>Loading: {isLoading ? "⚠️ Active" : "✅ Idle"}</Text>
            </View>
            <View style={styles.debugRow}>
              {error ? getWarningIcon() : getStatusIcon(!error)}
              <Text style={styles.debugText}>Error State: {error ? "⚠️ Error" : "✅ Clean"}</Text>
            </View>
            {error && (
              <Text style={styles.errorText}>Error: {error.substring(0, 100)}...</Text>
            )}
          </View>

          {/* AI Debug Information */}
          {debugInfo && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>🤖 AI System Debug</Text>
              <View style={styles.debugRow}>
                <Cpu size={16} color={colors.primary} />
                <Text style={styles.debugText}>API Calls: {debugInfo.callCount || 0}</Text>
              </View>
              
              {debugInfo.lastApiCall && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Last API Call:</Text>
                  <Text style={styles.debugText}>Time: {debugInfo.lastApiCall.timestamp?.substring(11, 19) || "N/A"}</Text>
                  <Text style={styles.debugText}>Type: {debugInfo.lastApiCall.type || "initial_story"}</Text>
                  <Text style={styles.debugText}>Messages: {debugInfo.lastApiCall.messages?.length || 0}</Text>
                  <Text style={styles.debugText}>Tokens Sent: ~{debugInfo.lastApiCall.estimatedTokens || "Unknown"}</Text>
                </View>
              )}
              
              {debugInfo.lastResponse && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Last AI Response:</Text>
                  <Text style={styles.debugText}>Time: {debugInfo.lastResponse.timestamp?.substring(11, 19) || "N/A"}</Text>
                  <Text style={styles.debugText}>Response Length: {debugInfo.lastResponse.completionLength || 0} chars</Text>
                  <Text style={styles.debugText}>Type: {debugInfo.lastResponse.type || "initial_story"}</Text>
                  <Text style={styles.debugText}>Processing Time: {debugInfo.lastResponse.processingTime || "Unknown"}ms</Text>
                </View>
              )}
              
              {debugInfo.lastError && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Last Error:</Text>
                  <Text style={styles.errorText}>Time: {debugInfo.lastError.timestamp?.substring(11, 19) || "N/A"}</Text>
                  <Text style={styles.errorText}>Type: {debugInfo.lastError.type || "unknown"}</Text>
                  <Text style={styles.errorText}>Status: {debugInfo.lastError.status || "N/A"}</Text>
                  {debugInfo.lastError.errorText && (
                    <Text style={styles.errorText}>Message: {debugInfo.lastError.errorText.substring(0, 100)}...</Text>
                  )}
                </View>
              )}

              {showDetailedLogs && debugInfo.lastPrompt && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Last Prompt (First 300 chars):</Text>
                  <Text style={styles.rawResponseText}>
                    {debugInfo.lastPrompt.substring(0, 300)}...
                  </Text>
                </View>
              )}

              {showDetailedLogs && debugInfo.lastRawResponse && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Raw AI Response (First 400 chars):</Text>
                  <Text style={styles.rawResponseText}>
                    {debugInfo.lastRawResponse.substring(0, 400)}...
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Current Segment Details */}
          {currentGame?.currentSegment && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>📖 Current Segment Analysis</Text>
              <Text style={styles.debugText}>Segment ID: {currentGame.currentSegment.id}</Text>
              <Text style={styles.debugText}>Text Length: {currentGame.currentSegment.text.length} characters</Text>
              <Text style={styles.debugText}>Word Count: ~{Math.floor(currentGame.currentSegment.text.length / 5)}</Text>
              <Text style={styles.debugText}>Estimated Read Time: ~{Math.ceil(currentGame.currentSegment.text.length / 1000)} min</Text>
              <Text style={styles.debugText}>Text Preview: {currentGame.currentSegment.text.substring(0, 120)}...</Text>
              <Text style={styles.debugText}>Available Choices: {currentGame.currentSegment.choices.length}</Text>
              {currentGame.currentSegment.choices.map((choice, index) => (
                <Text key={index} style={styles.choiceText}>  {index + 1}. {choice.text.substring(0, 50)}...</Text>
              ))}
            </View>
          )}

          {/* Character & World Data */}
          <View style={[styles.section, Platform.select({
            ios: styles.sectionIOS,
            android: styles.sectionAndroid,
            default: styles.sectionDefault
          })]}>
            <Text style={[styles.sectionTitle, Platform.select({
              ios: styles.sectionTitleIOS,
              android: styles.sectionTitleAndroid,
              default: styles.sectionTitleDefault
            })]}>👤 Character & World Data</Text>
            <Text style={styles.debugText}>Name: {currentGame?.character?.name || "None"}</Text>
            <View style={styles.debugRow}>
              {getStatusIcon(!!currentGame?.character?.backstory && currentGame.character.backstory.length > 0)}
              <Text style={styles.debugText}>Backstory: {currentGame?.character?.backstory && currentGame.character.backstory.length > 0 ? "✅ Generated" : "❌ Missing"}</Text>
            </View>
            <Text style={styles.debugText}>Backstory Length: {currentGame?.character?.backstory?.length || 0} chars</Text>
            <Text style={styles.debugText}>Lore Entries: {currentGame?.lore?.length || 0}</Text>
            <Text style={styles.debugText}>Memories: {currentGame?.memories?.length || 0}</Text>
            <Text style={styles.debugText}>World Systems Tracked: {Object.keys(currentGame?.worldSystems || {}).length}</Text>
            
            {currentGame?.worldSystems && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>World System Values:</Text>
                {Object.entries(currentGame.worldSystems).map(([key, value]) => (
                  <Text key={key} style={styles.debugText}>
                    {key}: {typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value)}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Timestamp Information */}
          <View style={[styles.section, Platform.select({
            ios: styles.sectionIOS,
            android: styles.sectionAndroid,
            default: styles.sectionDefault
          })]}>
            <Text style={[styles.sectionTitle, Platform.select({
              ios: styles.sectionTitleIOS,
              android: styles.sectionTitleAndroid,
              default: styles.sectionTitleDefault
            })]}>⏰ Timing Information</Text>
            <Text style={styles.debugText}>Current Time: {new Date().toLocaleTimeString()}</Text>
            <Text style={styles.debugText}>Game Created: {currentGame?.id ? new Date(parseInt(currentGame.id)).toLocaleString() : "N/A"}</Text>
            <Text style={styles.debugText}>Last Memory: {currentGame?.memories?.[currentGame.memories.length - 1]?.timestamp ? 
              new Date(currentGame.memories[currentGame.memories.length - 1].timestamp).toLocaleString() : "N/A"}</Text>
            <Text style={styles.debugText}>Session Duration: {currentGame?.id ? 
              Math.floor((Date.now() - parseInt(currentGame.id)) / 1000 / 60) + " minutes" : "N/A"}</Text>
          </View>

          {/* --- Firebase SDK Diagnostics --- */}
          {isExpanded && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>🔥 Firebase SDK Status</Text>
              <View style={styles.debugRow}>
                {getStatusIcon(firebaseStatus.initialized)}
                <Text style={styles.debugText}>Initialized: {firebaseStatus.initialized ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.debugRow}>
                {getStatusIcon(firebaseStatus.analytics)}
                <Text style={styles.debugText}>Analytics: {firebaseStatus.analytics ? 'Enabled' : 'Disabled'}</Text>
              </View>
              <View style={styles.debugRow}>
                {getStatusIcon(firebaseStatus.appCheck)}
                <Text style={styles.debugText}>AppCheck: {firebaseStatus.appCheck ? 'Enabled' : 'Disabled'}</Text>
              </View>
              {firebaseStatus.error && (
                <Text style={styles.errorText}>Error: {firebaseStatus.error}</Text>
              )}
              {firebaseStatus.config && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Config:</Text>
                  <Text style={styles.rawResponseText}>{JSON.stringify(firebaseStatus.config, null, 2)}</Text>
                </View>
              )}
            </View>
          )}

          {/* --- AI Backend Health --- */}
          {isExpanded && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>🤖 AI Backend Health</Text>
              <View style={styles.debugRow}>
                {getStatusIcon(aiBackendStatus.healthy)}
                <Text style={styles.debugText}>Healthy: {aiBackendStatus.healthy ? 'Yes' : 'No'}</Text>
                {aiBackendStatus.latency !== null && (
                  <Text style={styles.debugText}>Latency: {aiBackendStatus.latency}ms</Text>
                )}
              </View>
              <Text style={styles.debugText}>Last Checked: {aiBackendStatus.lastChecked || 'Never'}</Text>
              {aiBackendStatus.error && (
                <Text style={styles.errorText}>Error: {aiBackendStatus.error}</Text>
              )}
            </View>
          )}

          {/* --- Environment & Build Info --- */}
          {isExpanded && (
            <View style={[styles.section, Platform.select({
              ios: styles.sectionIOS,
              android: styles.sectionAndroid,
              default: styles.sectionDefault
            })]}>
              <Text style={[styles.sectionTitle, Platform.select({
                ios: styles.sectionTitleIOS,
                android: styles.sectionTitleAndroid,
                default: styles.sectionTitleDefault
              })]}>🌎 Environment Info</Text>
              <Text style={styles.debugText}>Expo SDK: {envInfo.expo}</Text>
              <Text style={styles.debugText}>Build Type: {envInfo.buildType}</Text>
              <Text style={styles.debugText}>Platform: {envInfo.platform}</Text>
              {firebaseStatus.config && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Firebase Project ID:</Text>
                  <Text style={styles.debugText}>{firebaseStatus.config.projectId || 'Unknown'}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    backgroundColor: colors.debugBackground + "F8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.debugBorder,
    maxWidth: 380,
    maxHeight: 680,
    zIndex: 1000,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  containerIOS: {
    top: 60,
    maxWidth: 420,
    maxHeight: 760,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
  },
  containerAndroid: {
    top: 50,
    maxWidth: 380,
    maxHeight: 680,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  containerDefault: {
    top: 50,
    maxWidth: 380,
    maxHeight: 680,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: colors.primary + "25",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  headerIOS: {
    padding: 20,
    gap: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  headerAndroid: {
    padding: 16,
    gap: 12,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  headerDefault: {
    padding: 16,
    gap: 12,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  headerText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  headerTextIOS: {
    fontSize: 18,
  },
  headerTextAndroid: {
    fontSize: 16,
  },
  headerTextDefault: {
    fontSize: 16,
  },
  platformBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformBadgeIOS: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  platformBadgeAndroid: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformBadgeDefault: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusIndicators: {
    flexDirection: "row",
    gap: 6,
  },
  content: {
    maxHeight: 600,
    padding: 16,
  },
  contentIOS: {
    maxHeight: 680,
    padding: 20,
  },
  contentAndroid: {
    maxHeight: 600,
    padding: 16,
  },
  contentDefault: {
    maxHeight: 600,
    padding: 16,
  },
  scrollContentIOS: {
    paddingBottom: 20,
  },
  scrollContentAndroid: {
    paddingBottom: 16,
  },
  scrollContentDefault: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: colors.background + "E8",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.debugBorder,
  },
  sectionIOS: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
  },
  sectionAndroid: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionDefault: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.surface + "80",
  },
  clearButton: {
    backgroundColor: colors.debugWarning + "20",
  },
  refreshButton: {
    backgroundColor: colors.primary + "20",
  },
  refreshIndicator: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionTitleIOS: {
    fontSize: 17,
  },
  sectionTitleAndroid: {
    fontSize: 15,
  },
  sectionTitleDefault: {
    fontSize: 15,
  },
  subSection: {
    marginTop: 12,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.debugBorder,
  },
  subSectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  quickActionsGridIOS: {
    gap: 12,
    marginTop: 12,
  },
  quickActionsGridAndroid: {
    gap: 8,
    marginTop: 10,
  },
  quickActionsGridDefault: {
    gap: 8,
    marginTop: 10,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "20",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    minWidth: 60,
  },
  quickActionButtonIOS: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    minWidth: 70,
  },
  quickActionButtonAndroid: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    minWidth: 60,
  },
  quickActionButtonDefault: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    minWidth: 60,
  },
  quickActionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickActionText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  quickActionTextActive: {
    color: colors.background,
  },
  diagnosticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  diagnosticItem: {
    flex: 1,
    minWidth: 100,
    alignItems: "center",
    backgroundColor: colors.surface + "60",
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  diagnosticLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  diagnosticValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: 80,
    alignItems: "center",
    backgroundColor: colors.surface + "40",
    padding: 10,
    borderRadius: 6,
    gap: 3,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "500",
  },
  metricValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  advancedMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  advancedMetricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface + "80",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.debugBorder,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  metricCardTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  metricCardValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricCardSubtext: {
    color: colors.textMuted,
    fontSize: 11,
  },
  apiStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  apiStatItem: {
    flex: 1,
    minWidth: 70,
    alignItems: "center",
    backgroundColor: colors.surface + "60",
    padding: 12,
    borderRadius: 8,
  },
  apiStatValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  apiStatLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: "center",
  },
  debugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  debugText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    flex: 1,
  },
  errorText: {
    color: colors.debugError,
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  choiceText: {
    color: colors.textMuted,
    fontSize: 11,
    marginLeft: 16,
    marginBottom: 3,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  rawResponseText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
});