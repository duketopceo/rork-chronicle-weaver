import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Switch } from 'react-native';
import { colors } from '@/constants/colors';
import { 
  Bug, X, RefreshCw, AlertTriangle, CheckCircle, Clock, Activity, Database, 
  Zap, Eye, Trash2, Download, Settings, User, Code, BarChart3, Shield,
  Monitor, Cpu, Wifi, Battery, HardDrive, TrendingUp, TrendingDown,
  PlayCircle, PauseCircle, SkipForward, Rewind, FastForward
} from 'lucide-react-native';
import { 
  useDebugSteps, 
  useDebugErrors, 
  useDebugMetrics, 
  debugSystem,
  DebugStep,
  DebugError,
  DebugPerformanceMetric
} from '@/utils/debugSystem';
import { useGameStore } from '@/store/gameStore';

interface UltraDebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const UltraDebugPanel: React.FC<UltraDebugPanelProps> = ({ visible, onClose }) => {
  // Mode switching between Simple and Advanced
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'monitoring' | 'errors' | 'performance' | 'game' | 'system'>('dashboard');
  
  // Data hooks
  const steps = useDebugSteps();
  const errors = useDebugErrors();
  const metrics = useDebugMetrics();
  const { currentGame, gameSetup, isLoading } = useGameStore();

  // Computed data
  const recentSteps = steps.slice(-5);
  const criticalErrors = errors.filter(e => e.severity === 'critical');
  const warnings = errors.filter(e => e.severity === 'medium' || e.severity === 'high');
  const successfulSteps = steps.filter(s => s.status === 'success').length;
  const errorSteps = steps.filter(s => s.status === 'error').length;
  const avgStepTime = steps.length > 0 ? steps.reduce((acc, s) => acc + (s.duration || 0), 0) / steps.length : 0;

  // Auto-refresh every 2 seconds
  const [refreshCounter, setRefreshCounter] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCounter(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleExportData = () => {
    const data = debugSystem.exportDebugData();
    console.log('📊 Ultra Debug Panel - Data exported to console');
  };

  const handleClearAll = () => {
    debugSystem.clearAll();
  };

  const getStatusColor = (status: DebugStep['status']) => {
    switch (status) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'pending': return colors.textSecondary;
      default: return colors.text;
    }
  };

  const getSeverityColor = (severity: DebugError['severity']) => {
    switch (severity) {
      case 'low': return colors.success;
      case 'medium': return colors.warning;
      case 'high': return colors.error;
      case 'critical': return '#ff1744';
      default: return colors.text;
    }
  };

  // SIMPLIFIED MODE - User-friendly dashboard
  const renderSimpleDashboard = () => (
    <ScrollView style={styles.tabContent}>
      {/* Health Status Cards */}
      <View style={styles.healthGrid}>
        <View style={[styles.healthCard, { borderLeftColor: criticalErrors.length > 0 ? colors.error : colors.success }]}>
          <View style={styles.healthCardHeader}>
            <Shield size={20} color={criticalErrors.length > 0 ? colors.error : colors.success} />
            <Text style={styles.healthCardTitle}>App Health</Text>
          </View>
          <Text style={[styles.healthCardValue, { color: criticalErrors.length > 0 ? colors.error : colors.success }]}>
            {criticalErrors.length > 0 ? 'Issues Found' : 'All Good'}
          </Text>
          <Text style={styles.healthCardSubtext}>
            {criticalErrors.length} critical • {warnings.length} warnings
          </Text>
        </View>

        <View style={[styles.healthCard, { borderLeftColor: successfulSteps > errorSteps ? colors.success : colors.warning }]}>
          <View style={styles.healthCardHeader}>
            <TrendingUp size={20} color={successfulSteps > errorSteps ? colors.success : colors.warning} />
            <Text style={styles.healthCardTitle}>Performance</Text>
          </View>
          <Text style={[styles.healthCardValue, { color: successfulSteps > errorSteps ? colors.success : colors.warning }]}>
            {successfulSteps > errorSteps ? 'Smooth' : 'Slow'}
          </Text>
          <Text style={styles.healthCardSubtext}>
            {Math.round(avgStepTime)}ms avg • {steps.length} operations
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsGrid}>
        <View style={styles.quickStat}>
          <Activity size={16} color={colors.primary} />
          <Text style={styles.quickStatNumber}>{steps.length}</Text>
          <Text style={styles.quickStatLabel}>Actions</Text>
        </View>
        <View style={styles.quickStat}>
          <CheckCircle size={16} color={colors.success} />
          <Text style={styles.quickStatNumber}>{successfulSteps}</Text>
          <Text style={styles.quickStatLabel}>Success</Text>
        </View>
        <View style={styles.quickStat}>
          <AlertTriangle size={16} color={colors.error} />
          <Text style={styles.quickStatNumber}>{errorSteps}</Text>
          <Text style={styles.quickStatLabel}>Errors</Text>
        </View>
        <View style={styles.quickStat}>
          <Clock size={16} color={colors.warning} />
          <Text style={styles.quickStatNumber}>{Math.round(avgStepTime)}</Text>
          <Text style={styles.quickStatLabel}>ms avg</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.simpleSection}>
        <Text style={styles.simpleSectionTitle}>Recent Activity</Text>
        {recentSteps.map((step) => (
          <View key={step.id} style={styles.simpleActivityItem}>
            <View style={[styles.activityDot, { backgroundColor: getStatusColor(step.status) }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{step.step}</Text>
              <Text style={styles.activityMessage}>{step.message}</Text>
              <Text style={styles.activityTime}>
                {new Date(step.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Critical Alerts */}
      {criticalErrors.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={styles.alertTitle}>🚨 Critical Issues</Text>
          {criticalErrors.slice(0, 2).map((error) => (
            <View key={error.id} style={styles.alertItem}>
              <Text style={styles.alertText}>{error.context}</Text>
              <Text style={styles.alertSubtext}>{error.error.message}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // ADVANCED MODE - Deep technical details
  const renderAdvancedContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderAdvancedDashboard();
      case 'monitoring':
        return renderMonitoring();
      case 'errors':
        return renderErrors();
      case 'performance':
        return renderPerformance();
      case 'game':
        return renderGameState();
      case 'system':
        return renderSystemInfo();
      default:
        return renderAdvancedDashboard();
    }
  };

  const renderAdvancedDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.overviewGrid}>
        <View style={styles.overviewCard}>
          <Activity size={24} color={colors.primary} />
          <Text style={styles.overviewNumber}>{steps.length}</Text>
          <Text style={styles.overviewLabel}>Total Steps</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <AlertTriangle size={24} color={colors.error} />
          <Text style={styles.overviewNumber}>{errors.length}</Text>
          <Text style={styles.overviewLabel}>Errors</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <CheckCircle size={24} color={colors.success} />
          <Text style={styles.overviewNumber}>{successfulSteps}</Text>
          <Text style={styles.overviewLabel}>Successful</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <Zap size={24} color={colors.warning} />
          <Text style={styles.overviewNumber}>{metrics.length}</Text>
          <Text style={styles.overviewLabel}>Metrics</Text>
        </View>
      </View>

      {/* Detailed Recent Steps */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Operations</Text>
        {recentSteps.map((step) => (
          <View key={step.id} style={styles.recentItem}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(step.status) }]} />
            <View style={styles.recentContent}>
              <Text style={styles.recentStep}>{step.step}</Text>
              <Text style={styles.recentMessage}>{step.message}</Text>
              <Text style={styles.recentTime}>
                {new Date(step.timestamp).toLocaleTimeString()}
                {step.duration && ` (${step.duration}ms)`}
              </Text>
              {step.data && (
                <Text style={styles.recentData}>
                  Data: {JSON.stringify(step.data).substring(0, 100)}...
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMonitoring = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Real-Time Monitoring</Text>
      {steps.map((step) => (
        <View key={step.id} style={styles.stepItem}>
          <View style={styles.stepHeader}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(step.status) }]} />
            <Text style={styles.stepTitle}>{step.step}</Text>
            <Text style={styles.stepTime}>{new Date(step.timestamp).toLocaleTimeString()}</Text>
          </View>
          <Text style={styles.stepMessage}>{step.message}</Text>
          {step.duration && (
            <Text style={styles.stepDuration}>Duration: {step.duration}ms</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderErrors = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Error Analysis</Text>
      {errors.map((error) => (
        <View key={error.id} style={styles.errorItem}>
          <View style={styles.errorHeader}>
            <View style={[styles.severityDot, { backgroundColor: getSeverityColor(error.severity) }]} />
            <Text style={styles.errorContext}>{error.context}</Text>
            <Text style={styles.errorTime}>{new Date(error.timestamp).toLocaleTimeString()}</Text>
          </View>
          <Text style={styles.errorMessage}>{error.error.message}</Text>
          {error.stack && (
            <View style={styles.errorStack}>
              <Text style={styles.errorStackTitle}>Stack Trace:</Text>
              <Text style={styles.errorStackContent}>{error.stack}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderPerformance = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(metric.status as any) }]} />
            <Text style={styles.metricName}>{metric.name}</Text>
            <Text style={styles.metricTime}>{new Date(metric.timestamp).toLocaleTimeString()}</Text>
          </View>
          <Text style={styles.metricValue}>
            {metric.value}{metric.unit}
            {metric.threshold && ` (threshold: ${metric.threshold}${metric.unit})`}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderGameState = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Game State Debug</Text>
      <View style={styles.gameStateSection}>
        <Text style={styles.gameStateTitle}>Current Game</Text>
        <Text style={styles.gameStateValue}>
          {currentGame ? 'Active' : 'No Game'}
        </Text>
        
        <Text style={styles.gameStateTitle}>Setup State</Text>
        <Text style={styles.gameStateValue}>
          {gameSetup ? JSON.stringify(gameSetup, null, 2) : 'No Setup'}
        </Text>
        
        <Text style={styles.gameStateTitle}>Loading State</Text>
        <Text style={styles.gameStateValue}>
          {isLoading ? 'Loading...' : 'Ready'}
        </Text>
      </View>
    </ScrollView>
  );

  const renderSystemInfo = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>System Information</Text>
      <View style={styles.systemInfoGrid}>
        <View style={styles.systemInfoCard}>
          <Monitor size={20} color={colors.primary} />
          <Text style={styles.systemInfoLabel}>Platform</Text>
          <Text style={styles.systemInfoValue}>Web</Text>
        </View>
        <View style={styles.systemInfoCard}>
          <Cpu size={20} color={colors.primary} />
          <Text style={styles.systemInfoLabel}>Memory</Text>
          <Text style={styles.systemInfoValue}>72MB</Text>
        </View>
        <View style={styles.systemInfoCard}>
          <Wifi size={20} color={colors.success} />
          <Text style={styles.systemInfoLabel}>Network</Text>
          <Text style={styles.systemInfoValue}>Connected</Text>
        </View>
        <View style={styles.systemInfoCard}>
          <Battery size={20} color={colors.success} />
          <Text style={styles.systemInfoLabel}>Performance</Text>
          <Text style={styles.systemInfoValue}>Good</Text>
        </View>
      </View>
    </ScrollView>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bug size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>
              {isAdvancedMode ? 'Ultra Debug Panel' : 'App Monitor'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.modeToggle}>
              <Text style={styles.modeLabel}>Simple</Text>
              <Switch
                value={isAdvancedMode}
                onValueChange={setIsAdvancedMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
              <Text style={styles.modeLabel}>Advanced</Text>
            </View>
            <TouchableOpacity style={styles.headerButton} onPress={handleExportData}>
              <Download size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleClearAll}>
              <Trash2 size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Advanced Mode Tabs */}
        {isAdvancedMode && (
          <View style={styles.tabs}>
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'monitoring', label: 'Monitor', icon: Activity },
              { key: 'errors', label: 'Errors', icon: AlertTriangle },
              { key: 'performance', label: 'Performance', icon: Zap },
              { key: 'game', label: 'Game', icon: PlayCircle },
              { key: 'system', label: 'System', icon: Settings },
            ].map(({ key, label, icon: Icon }) => (
              <TouchableOpacity
                key={key}
                style={[styles.tab, activeTab === key && styles.activeTab]}
                onPress={() => setActiveTab(key as any)}
              >
                <Icon size={14} color={activeTab === key ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabLabel, activeTab === key && styles.activeTabLabel]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {isAdvancedMode ? renderAdvancedContent() : renderSimpleDashboard()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  headerButton: {
    padding: 8,
    borderRadius: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },

  // Simple Mode Styles
  healthGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  healthCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  healthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  healthCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  healthCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  healthCardSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickStat: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  quickStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  quickStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  simpleSection: {
    marginBottom: 20,
  },
  simpleSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  simpleActivityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  activityMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },
  alertSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 12,
  },
  alertItem: {
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  alertSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Advanced Mode Styles (reusing from EnhancedDebugPanel)
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  overviewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recentSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 6,
    marginBottom: 8,
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  recentContent: {
    flex: 1,
  },
  recentStep: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  recentMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recentTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  recentData: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  stepItem: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stepTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stepTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  stepMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  stepDuration: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorItem: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  errorContext: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  errorTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  errorMessage: {
    fontSize: 13,
    color: colors.error,
    marginBottom: 8,
  },
  errorStack: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  errorStackTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  errorStackContent: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  metricItem: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metricName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  metricTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  gameStateSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
  },
  gameStateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  gameStateValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  systemInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  systemInfoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  systemInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  systemInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
});
