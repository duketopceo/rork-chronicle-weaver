import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from "react-native";
import { colors } from "@/constants/colors";
import { useGameStore } from "@/store/gameStore";
import { Bug, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2, Crown, Zap, Eye, EyeOff, Smartphone, Monitor, Cpu, Wifi, Battery, Clock, MemoryStick, Activity } from "lucide-react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [showPlatformInfo, setShowPlatformInfo] = useState(false);
  const { currentGame, gameSetup, isLoading, error } = useGameStore();

  if (!__DEV__) return null; // Only show in development

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle size={16} color={colors.success} />
    ) : (
      <XCircle size={16} color={colors.error} />
    );
  };

  const getWarningIcon = () => (
    <AlertTriangle size={16} color={colors.warning} />
  );

  const getDebugInfo = () => {
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
      orientation: SCREEN_WIDTH > SCREEN_HEIGHT ? "Landscape" : "Portrait"
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

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Bug size={18} color={colors.primary} />
        <Text style={styles.headerText}>Debug Panel</Text>
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
                  <Trash2 size={16} color={colors.warning} />
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
              <Text style={styles.debugText}>Pixel Ratio: {Platform.select({ ios: "iOS", android: "Android", web: "Web", default: "Unknown" })}</Text>
            </View>
          )}

          {/* Performance Metrics */}
          {showPerformanceMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Performance Metrics</Text>
              <View style={styles.debugRow}>
                <MemoryStick size={16} color={colors.warning} />
                <Text style={styles.debugText}>Memory Usage: ~{performanceMetrics.memoryUsage}MB</Text>
              </View>
              <View style={styles.debugRow}>
                <Clock size={16} color={colors.primary} />
                <Text style={styles.debugText}>Render Time: ~{performanceMetrics.renderTime}ms</Text>
              </View>
              <View style={styles.debugRow}>
                <Wifi size={16} color={colors.success} />
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
                <Battery size={16} color={colors.success} />
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
              
              {debugInfo.apiCallHistory && debugInfo.apiCallHistory.length > 0 && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Recent API Activity:</Text>
                  {debugInfo.apiCallHistory.slice(0, 5).map((call, index) => (
                    <Text key={index} style={styles.debugText}>
                      {call.timestamp?.substring(11, 19) || "N/A"}: {call.type} - {call.era || call.choice || "N/A"}
                    </Text>
                  ))}
                </View>
              )}
              
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

          {/* Memory & Storage Analysis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 Memory & Storage</Text>
            <Text style={styles.debugText}>Game Object Size: ~{JSON.stringify(currentGame || {}).length} bytes</Text>
            <Text style={styles.debugText}>Setup Object Size: ~{JSON.stringify(gameSetup || {}).length} bytes</Text>
            <Text style={styles.debugText}>Total Estimated Storage: ~{(JSON.stringify(currentGame || {}).length + JSON.stringify(gameSetup || {}).length) / 1024} KB</Text>
            <Text style={styles.debugText}>Debug Info Size: ~{JSON.stringify(debugInfo || {}).length} bytes</Text>
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

          {/* Additional Debug Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Advanced Debug Info</Text>
            <Text style={styles.debugText}>React Native Version: {Platform.constants?.reactNativeVersion?.major || "Unknown"}.{Platform.constants?.reactNativeVersion?.minor || "0"}</Text>
            <Text style={styles.debugText}>Expo SDK: 52.0.0</Text>
            <Text style={styles.debugText}>Build Type: {__DEV__ ? "Development" : "Production"}</Text>
            <Text style={styles.debugText}>Platform Constants: {JSON.stringify(Platform.constants).substring(0, 100)}...</Text>
            <Text style={styles.debugText}>Screen Scale: {Platform.select({ ios: "iOS Scale", android: "Android Scale", web: "Web Scale", default: "Unknown" })}</Text>
          </View>

          {/* Network & API Debug */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 Network & API Debug</Text>
            <Text style={styles.debugText}>API Endpoint: https://toolkit.rork.com/text/llm/</Text>
            <Text style={styles.debugText}>Connection Status: {Platform.OS === 'web' ? 'Web Browser' : 'Native App'}</Text>
            <Text style={styles.debugText}>Last API Call: {debugInfo?.lastApiCall?.timestamp || "None"}</Text>
            <Text style={styles.debugText}>API Call Count: {debugInfo?.callCount || 0}</Text>
            <Text style={styles.debugText}>Error Count: {debugInfo?.apiCallHistory?.filter(call => call.error)?.length || 0}</Text>
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
    backgroundColor: colors.surface + "F5",
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    borderWidth: 1,
    borderColor: colors.primary,
    maxWidth: Platform.select({ ios: 380, android: 350, default: 350 }),
    maxHeight: Platform.select({ ios: 700, android: 600, default: 600 }),
    zIndex: 1000,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: Platform.select({ ios: 6, android: 4, default: 4 }) },
    shadowOpacity: 0.25,
    shadowRadius: Platform.select({ ios: 12, android: 8, default: 8 }),
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Platform.select({ ios: 14, android: 10, default: 10 }),
    gap: Platform.select({ ios: 10, android: 8, default: 8 }),
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
    maxHeight: Platform.select({ ios: 600, android: 500, default: 500 }),
    padding: Platform.select({ ios: 14, android: 10, default: 10 }),
  },
  section: {
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
    backgroundColor: colors.background + "E8",
    borderRadius: Platform.select({ ios: 12, android: 8, default: 8 }),
    padding: Platform.select({ ios: 14, android: 10, default: 10 }),
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 10, android: 6, default: 6 }),
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
    marginTop: Platform.select({ ios: 10, android: 6, default: 6 }),
    marginLeft: Platform.select({ ios: 10, android: 6, default: 6 }),
    paddingLeft: Platform.select({ ios: 10, android: 6, default: 6 }),
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  subSectionTitle: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 13, android: 12, default: 12 }),
    fontWeight: "600",
    marginBottom: Platform.select({ ios: 6, android: 4, default: 4 }),
  },
  clearButton: {
    padding: Platform.select({ ios: 6, android: 4, default: 4 }),
  },
  refreshButton: {
    padding: Platform.select({ ios: 6, android: 4, default: 4 }),
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: Platform.select({ ios: 10, android: 8, default: 8 }),
    marginTop: Platform.select({ ios: 8, android: 6, default: 6 }),
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "20",
    borderRadius: Platform.select({ ios: 8, android: 6, default: 6 }),
    paddingHorizontal: Platform.select({ ios: 12, android: 8, default: 8 }),
    paddingVertical: Platform.select({ ios: 8, android: 6, default: 6 }),
    gap: Platform.select({ ios: 6, android: 4, default: 4 }),
    borderWidth: 1,
    borderColor: colors.primary + "40",
  },
  quickActionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickActionText: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 12, android: 11, default: 11 }),
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
    color: colors.error,
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