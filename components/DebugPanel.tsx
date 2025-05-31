import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "@/constants/colors";
import { useGameStore } from "@/store/gameStore";
import { Bug, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2, Crown, Zap, Eye, EyeOff } from "lucide-react-native";

export default function DebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);
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
        apiCallHistory: []
      };
    }
  };

  const debugInfo = getDebugInfo();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Bug size={18} color={colors.primary} />
        <Text style={styles.headerText}>Debug</Text>
        {isExpanded ? (
          <ChevronUp size={18} color={colors.primary} />
        ) : (
          <ChevronDown size={18} color={colors.primary} />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎮 Game State</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  onPress={() => setShowDetailedLogs(!showDetailedLogs)} 
                  style={styles.toggleButton}
                >
                  {showDetailedLogs ? <EyeOff size={16} color={colors.warning} /> : <Eye size={16} color={colors.warning} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={clearDebugInfo} style={styles.clearButton}>
                  <Trash2 size={16} color={colors.warning} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.debugRow}>
              {getStatusIcon(!!currentGame)}
              <Text style={styles.debugText}>Current Game: {currentGame ? "✅ Yes" : "❌ No"}</Text>
            </View>
            <Text style={styles.debugText}>Game ID: {currentGame?.id || "None"}</Text>
            <Text style={styles.debugText}>Turn Count: {currentGame?.turnCount || 0}</Text>
            <View style={styles.debugRow}>
              {getStatusIcon(!!currentGame?.currentSegment)}
              <Text style={styles.debugText}>Current Segment: {currentGame?.currentSegment ? "✅ Yes" : "❌ No"}</Text>
            </View>
            <Text style={styles.debugText}>Segment ID: {currentGame?.currentSegment?.id || "None"}</Text>
            <Text style={styles.debugText}>Segment Text Length: {currentGame?.currentSegment?.text?.length || 0}</Text>
            <Text style={styles.debugText}>Choices Count: {currentGame?.currentSegment?.choices?.length || 0}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Setup State</Text>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔄 Loading & Errors</Text>
            <View style={styles.debugRow}>
              {isLoading ? getWarningIcon() : getStatusIcon(!isLoading)}
              <Text style={styles.debugText}>Is Loading: {isLoading ? "⚠️ Yes" : "✅ No"}</Text>
            </View>
            <View style={styles.debugRow}>
              {error ? getWarningIcon() : getStatusIcon(!error)}
              <Text style={styles.debugText}>Error: {error || "✅ None"}</Text>
            </View>
          </View>

          {debugInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤖 AI Debug Info</Text>
              <Text style={styles.debugText}>API Call Count: {debugInfo.callCount || 0}</Text>
              
              {debugInfo.apiCallHistory && debugInfo.apiCallHistory.length > 0 && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Recent API Calls:</Text>
                  {debugInfo.apiCallHistory.slice(0, 3).map((call, index) => (
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
                </View>
              )}
              
              {debugInfo.lastResponse && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Last Response:</Text>
                  <Text style={styles.debugText}>Time: {debugInfo.lastResponse.timestamp?.substring(11, 19) || "N/A"}</Text>
                  <Text style={styles.debugText}>Completion Length: {debugInfo.lastResponse.completionLength || 0}</Text>
                  <Text style={styles.debugText}>Type: {debugInfo.lastResponse.type || "initial_story"}</Text>
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

              {showDetailedLogs && debugInfo.lastRawResponse && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Raw AI Response (First 300 chars):</Text>
                  <Text style={styles.rawResponseText}>
                    {debugInfo.lastRawResponse.substring(0, 300)}...
                  </Text>
                </View>
              )}
            </View>
          )}

          {currentGame?.currentSegment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📖 Current Segment</Text>
              <Text style={styles.debugText}>Segment ID: {currentGame.currentSegment.id}</Text>
              <Text style={styles.debugText}>Text Length: {currentGame.currentSegment.text.length}</Text>
              <Text style={styles.debugText}>Text Preview: {currentGame.currentSegment.text.substring(0, 100)}...</Text>
              <Text style={styles.debugText}>Choices:</Text>
              {currentGame.currentSegment.choices.map((choice, index) => (
                <Text key={index} style={styles.choiceText}>  {index + 1}. {choice.text.substring(0, 40)}...</Text>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Character Data</Text>
            <Text style={styles.debugText}>Name: {currentGame?.character?.name || "None"}</Text>
            <View style={styles.debugRow}>
              {getStatusIcon(!!currentGame?.character?.backstory && currentGame.character.backstory.length > 0)}
              <Text style={styles.debugText}>Backstory: {currentGame?.character?.backstory && currentGame.character.backstory.length > 0 ? "✅ Yes" : "❌ No"}</Text>
            </View>
            <Text style={styles.debugText}>Backstory Length: {currentGame?.character?.backstory?.length || 0}</Text>
            <Text style={styles.debugText}>Lore Entries: {currentGame?.lore?.length || 0}</Text>
            <Text style={styles.debugText}>Memories: {currentGame?.memories?.length || 0}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: colors.surface + "F0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    maxWidth: 350,
    maxHeight: 600,
    zIndex: 1000,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
    backgroundColor: colors.primary + "20",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  content: {
    maxHeight: 500,
    padding: 10,
  },
  section: {
    marginBottom: 12,
    backgroundColor: colors.background + "E0",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  subSection: {
    marginTop: 6,
    marginLeft: 6,
    paddingLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  subSectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  clearButton: {
    padding: 4,
  },
  toggleButton: {
    padding: 4,
  },
  debugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  debugText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 3,
    fontFamily: "monospace",
    flex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 11,
    marginBottom: 3,
    fontFamily: "monospace",
  },
  choiceText: {
    color: colors.textMuted,
    fontSize: 10,
    marginLeft: 12,
    marginBottom: 2,
    fontFamily: "monospace",
  },
  rawResponseText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: "monospace",
    backgroundColor: colors.surface,
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
});