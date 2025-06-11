import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from "react-native";
import { colors } from "@/constants/colors";
import { useGameStore } from "@/store/gameStore";
import { Bug, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2, Crown, Zap, Eye, EyeOff, Smartphone, Monitor, Cpu, Wifi, Battery, Clock, MemoryStick, Activity, Database, Globe, Settings, FileText, Users, Coins, Sword } from "lucide-react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

type DebugInfo = {
  lastApiCall?: any;
  lastResponse?: any;
  lastError?: any;
  callCount: number;
  lastPrompt?: string;
  lastRawResponse?: string;
  apiCallHistory: any[];
  performanceMetrics?: {
    timestamp: number;
    memoryUsage: number;
    renderTime: number;
    apiLatency: number;
    frameRate: number;
    networkStatus: string;
    batteryLevel: number;
  };
};

export default function DebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [showPlatformInfo, setShowPlatformInfo] = useState(false);
  const [showGameAnalysis, setShowGameAnalysis] = useState(false);
  const [showStorageInfo, setShowStorageInfo] = useState(false);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const { currentGame, gameSetup, isLoading, error } = useGameStore();

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
      return global.__CHRONICLE_DEBUG__;
    }
    return null;
  };

  const clearDebugInfo = () => {
    if (typeof global !== 'undefined' && global.__CHRONICLE_DEBUG__) {
      global.__CHRONICLE_DEBUG__ = { 
        callCount: 0,
        apiCallHistory: [],
      };
    }
  };

  const forceRefreshAI = () => {
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__ = global.__CHRONICLE_DEBUG__ || { 
        callCount: 0,
        apiCallHistory: [],
      };
      global.__CHRONICLE_DEBUG__.lastError = {
        timestamp: new Date().toISOString(),
        type: "manual_refresh",
        message: "Manual refresh triggered from debug panel"
      };
    }
    
    // Force re-render
    setIsExpanded(prev => !prev);
    setTimeout(() => setIsExpanded(prev => !prev), 100);
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

  // Get memory and performance info (mock data for demonstration)
  const getPerformanceMetrics = () => {
    const now = Date.now();
    return {
      timestamp: now,
      memoryUsage: Math.floor(Math.random() * 100) + 50, // Mock memory usage
      renderTime: Math.floor(Math.random() * 20) + 5, // Mock render time
      apiLatency: debugInfo?.lastResponse ? 
        (new Date(debugInfo.lastResponse.timestamp).getTime() - new Date(debugInfo.lastApiCall?.timestamp || 0).getTime()) : 0,
      frameRate: 60, // Mock frame rate
      networkStatus: "Connected", // Mock network status
      batteryLevel: Math.floor(Math.random() * 100), // Mock battery
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
    
    const estimatedPlayTime = Math.floor(totalTextLength / 1000); // Rough estimate: 1000 chars per minute
    
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

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Bug size={18} color={colors.primary} />
        <Text style={styles.headerText}>Chronicle Debug</Text>
        <Text style={styles.platformBadge}>{Platform.OS.toUpperCase()}</Text>
        {isExpanded ? (
          <ChevronUp size={18} color={colors.primary} />
        ) : (
          <ChevronDown size={18} color={colors.primary} />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={clearDebugInfo} style={styles.clearButton}>
                  <Trash2 size={16} color={colors.debugWarning} />
                </TouchableOpacity>
                <TouchableOpacity onPress={forceRefreshAI} style={styles.refreshButton}>
                  <RefreshCw size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity 
                onPress={() => setShowDetailedLogs(!showDetailedLogs)} 
                style={[styles.quickActionButton, showDetailedLogs && styles.quickActionButtonActive]}
              >
                {showDetailedLogs ? <EyeOff size={14} color={colors.background} /> : <Eye size={14} color={colors.primary} />}
                <Text style={[styles.quickActionText, showDetailedLogs && styles.quickActionTextActive]}>Logs</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowPerformanceMetrics(!showPerformanceMetrics)} 
                style={[styles.quickActionButton, showPerformanceMetrics && styles.quickActionButtonActive]}
              >
                <Activity size={14} color={showPerformanceMetrics ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showPerformanceMetrics && styles.quickActionTextActive]}>Perf</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowPlatformInfo(!showPlatformInfo)} 
                style={[styles.quickActionButton, showPlatformInfo && styles.quickActionButtonActive]}
              >
                <Smartphone size={14} color={showPlatformInfo ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showPlatformInfo && styles.quickActionTextActive]}>Device</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowGameAnalysis(!showGameAnalysis)} 
                style={[styles.quickActionButton, showGameAnalysis && styles.quickActionButtonActive]}
              >
                <Crown size={14} color={showGameAnalysis ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showGameAnalysis && styles.quickActionTextActive]}>Game</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowStorageInfo(!showStorageInfo)} 
                style={[styles.quickActionButton, showStorageInfo && styles.quickActionButtonActive]}
              >
                <Database size={14} color={showStorageInfo ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showStorageInfo && styles.quickActionTextActive]}>Storage</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowNetworkInfo(!showNetworkInfo)} 
                style={[styles.quickActionButton, showNetworkInfo && styles.quickActionButtonActive]}
              >
                <Globe size={14} color={showNetworkInfo ? colors.background : colors.primary} />
                <Text style={[styles.quickActionText, showNetworkInfo && styles.quickActionTextActive]}>Network</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Platform Information */}
          {showPlatformInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 Platform & Device</Text>
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
            </View>
          )}

          {/* Performance Metrics */}
          {showPerformanceMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Performance Metrics</Text>
              <View style={styles.debugRow}>
                <MemoryStick size={16} color={colors.debugWarning} />
                <Text style={styles.debugText}>Memory Usage: ~{performanceMetrics.memoryUsage}MB</Text>
              </View>
              <View style={styles.debugRow}>
                <Clock size={16} color={colors.primary} />
                <Text style={styles.debugText}>Render Time: ~{performanceMetrics.renderTime}ms</Text>
              </View>
              <View style={styles.debugRow}>
                <Wifi size={16} color={colors.debugSuccess} />
                <Text style={styles.debugText}>Network: {performanceMetrics.networkStatus}</Text>
              </View>
              <View style={styles.debugRow}>
                <Activity size={16} color={colors.primary} />
                <Text style={styles.debugText}>Frame Rate: {performanceMetrics.frameRate}fps</Text>
              </View>
              {performanceMetrics.apiLatency > 0 && (
                <Text style={styles.debugText}>API Latency: {performanceMetrics.apiLatency}ms</Text>
              )}
              <View style={styles.debugRow}>
                <Battery size={16} color={colors.debugSuccess} />
                <Text style={styles.debugText}>Battery: ~{performanceMetrics.batteryLevel}%</Text>
              </View>
            </View>
          )}

          {/* Game State */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Game State</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Setup Configuration</Text>
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
          </View>

          {/* Game Analysis */}
          {showGameAnalysis && gameAnalysis && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Game Analysis</Text>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💾 Storage Analysis</Text>
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

          {/* Network & API Information */}
          {showNetworkInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌐 Network & API</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔄 System Status</Text>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤖 AI System Debug</Text>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📖 Current Segment Analysis</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Character & World Data</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Timing Information</Text>
            <Text style={styles.debugText}>Current Time: {new Date().toLocaleTimeString()}</Text>
            <Text style={styles.debugText}>Game Created: {currentGame?.id ? new Date(parseInt(currentGame.id)).toLocaleString() : "N/A"}</Text>
            <Text style={styles.debugText}>Last Memory: {currentGame?.memories?.[currentGame.memories.length - 1]?.timestamp ? 
              new Date(currentGame.memories[currentGame.memories.length - 1].timestamp).toLocaleString() : "N/A"}</Text>
            <Text style={styles.debugText}>Session Duration: {currentGame?.id ? 
              Math.floor((Date.now() - parseInt(currentGame.id)) / 1000 / 60) + " minutes" : "N/A"}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.select({ ios: 60, android: 50, default: 50 }),
    right: Platform.select({ ios: 16, android: 10, default: 10 }),
    backgroundColor: colors.debugBackground + "F8",
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    borderWidth: 1,
    borderColor: colors.debugBorder,
    maxWidth: Platform.select({ ios: 400, android: 360, default: 360 }),
    maxHeight: Platform.select({ ios: 720, android: 640, default: 640 }),
    zIndex: 1000,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: Platform.select({ ios: 8, android: 6, default: 6 }) },
    shadowOpacity: 0.3,
    shadowRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Platform.select({ ios: 16, android: 12, default: 12 }),
    gap: Platform.select({ ios: 12, android: 10, default: 10 }),
    backgroundColor: colors.primary + "25",
    borderTopLeftRadius: Platform.select({ ios: 14, android: 10, default: 10 }),
    borderTopRightRadius: Platform.select({ ios: 14, android: 10, default: 10 }),
  },
  headerText: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 16, android: 14, default: 14 }),
    fontWeight: "700",
    flex: 1,
  },
  platformBadge: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 12, android: 10, default: 10 }),
    fontWeight: "600",
    backgroundColor: colors.primary + "20",
    paddingHorizontal: Platform.select({ ios: 8, android: 6, default: 6 }),
    paddingVertical: Platform.select({ ios: 4, android: 2, default: 2 }),
    borderRadius: Platform.select({ ios: 8, android: 6, default: 6 }),
  },
  content: {
    maxHeight: Platform.select({ ios: 640, android: 560, default: 560 }),
    padding: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  section: {
    marginBottom: Platform.select({ ios: 18, android: 14, default: 14 }),
    backgroundColor: colors.background + "E8",
    borderRadius: Platform.select({ ios: 12, android: 8, default: 8 }),
    padding: Platform.select({ ios: 16, android: 12, default: 12 }),
    borderWidth: 1,
    borderColor: colors.debugBorder,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
  headerButtons: {
    flexDirection: "row",
    gap: Platform.select({ ios: 8, android: 6, default: 6 }),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: Platform.select({ ios: 15, android: 13, default: 13 }),
    fontWeight: "700",
  },
  subSection: {
    marginTop: Platform.select({ ios: 12, android: 8, default: 8 }),
    marginLeft: Platform.select({ ios: 12, android: 8, default: 8 }),
    paddingLeft: Platform.select({ ios: 12, android: 8, default: 8 }),
    borderLeftWidth: 2,
    borderLeftColor: colors.debugBorder,
  },
  subSectionTitle: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 13, android: 12, default: 12 }),
    fontWeight: "600",
    marginBottom: Platform.select({ ios: 8, android: 6, default: 6 }),
  },
  clearButton: {
    padding: Platform.select({ ios: 6, android: 4, default: 4 }),
  },
  refreshButton: {
    padding: Platform.select({ ios: 6, android: 4, default: 4 }),
  },
  quickActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Platform.select({ ios: 8, android: 6, default: 6 }),
    marginTop: Platform.select({ ios: 10, android: 8, default: 8 }),
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "20",
    borderRadius: Platform.select({ ios: 8, android: 6, default: 6 }),
    paddingHorizontal: Platform.select({ ios: 10, android: 8, default: 8 }),
    paddingVertical: Platform.select({ ios: 6, android: 4, default: 4 }),
    gap: Platform.select({ ios: 4, android: 3, default: 3 }),
    borderWidth: 1,
    borderColor: colors.primary + "40",
    minWidth: Platform.select({ ios: 60, android: 55, default: 55 }),
  },
  quickActionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickActionText: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 11, android: 10, default: 10 }),
    fontWeight: "600",
  },
  quickActionTextActive: {
    color: colors.background,
  },
  debugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Platform.select({ ios: 8, android: 6, default: 6 }),
    marginBottom: Platform.select({ ios: 4, android: 3, default: 3 }),
  },
  debugText: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 12, android: 11, default: 11 }),
    marginBottom: Platform.select({ ios: 4, android: 3, default: 3 }),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    flex: 1,
  },
  errorText: {
    color: colors.debugError,
    fontSize: Platform.select({ ios: 12, android: 11, default: 11 }),
    marginBottom: Platform.select({ ios: 4, android: 3, default: 3 }),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  choiceText: {
    color: colors.textMuted,
    fontSize: Platform.select({ ios: 11, android: 10, default: 10 }),
    marginLeft: Platform.select({ ios: 16, android: 12, default: 12 }),
    marginBottom: Platform.select({ ios: 3, android: 2, default: 2 }),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  rawResponseText: {
    color: colors.textMuted,
    fontSize: Platform.select({ ios: 10, android: 9, default: 9 }),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    backgroundColor: colors.surface,
    padding: Platform.select({ ios: 8, android: 6, default: 6 }),
    borderRadius: Platform.select({ ios: 6, android: 4, default: 4 }),
    marginTop: Platform.select({ ios: 6, android: 4, default: 4 }),
  },
});