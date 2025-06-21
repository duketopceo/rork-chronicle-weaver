import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { colors } from '@/constants/colors';
import { 
  Bug, X, RefreshCw, AlertTriangle, CheckCircle, Clock, 
  Activity, Database, Zap, Eye, Trash2, Download 
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

interface EnhancedDebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const EnhancedDebugPanel: React.FC<EnhancedDebugPanelProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'errors' | 'metrics' | 'overview'>('overview');
  const steps = useDebugSteps();
  const errors = useDebugErrors();
  const metrics = useDebugMetrics();

  const recentSteps = steps.slice(-10);
  const criticalErrors = errors.filter(e => e.severity === 'critical');
  const warnings = errors.filter(e => e.severity === 'medium' || e.severity === 'high');

  const handleExportData = () => {
    const data = debugSystem.exportDebugData();
    console.log('📊 Debug data exported to console');
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

  const getMetricStatusColor = (status: DebugPerformanceMetric['status']) => {
    switch (status) {
      case 'good': return colors.success;
      case 'warning': return colors.warning;
      case 'critical': return colors.error;
      default: return colors.text;
    }
  };

  const renderOverview = () => (
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
          <Text style={styles.overviewNumber}>{steps.filter(s => s.status === 'success').length}</Text>
          <Text style={styles.overviewLabel}>Successful</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <Zap size={24} color={colors.warning} />
          <Text style={styles.overviewNumber}>{metrics.length}</Text>
          <Text style={styles.overviewLabel}>Metrics</Text>
        </View>
      </View>

      {criticalErrors.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={styles.alertTitle}>🚨 Critical Issues</Text>
          {criticalErrors.slice(0, 3).map((error) => (
            <View key={error.id} style={styles.alertItem}>
              <Text style={styles.alertText}>{error.context}</Text>
              <Text style={styles.alertSubtext}>{error.error.message}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Steps</Text>
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
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSteps = () => (
    <ScrollView style={styles.tabContent}>
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
          {step.data && (
            <View style={styles.stepData}>
              <Text style={styles.stepDataTitle}>Data:</Text>
              <Text style={styles.stepDataContent}>{JSON.stringify(step.data, null, 2)}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderErrors = () => (
    <ScrollView style={styles.tabContent}>
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

  const renderMetrics = () => (
    <ScrollView style={styles.tabContent}>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <View style={[styles.statusDot, { backgroundColor: getMetricStatusColor(metric.status) }]} />
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

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bug size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>Debug Panel</Text>
          </View>
          <View style={styles.headerRight}>
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

        <View style={styles.tabs}>
          {[
            { key: 'overview', label: 'Overview', icon: Eye },
            { key: 'steps', label: 'Steps', icon: Activity },
            { key: 'errors', label: 'Errors', icon: AlertTriangle },
            { key: 'metrics', label: 'Metrics', icon: Zap },
          ].map(({ key, label, icon: Icon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeTab === key && styles.activeTab]}
              onPress={() => setActiveTab(key as any)}
            >
              <Icon size={16} color={activeTab === key ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabLabel, activeTab === key && styles.activeTabLabel]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'steps' && renderSteps()}
          {activeTab === 'errors' && renderErrors()}
          {activeTab === 'metrics' && renderMetrics()}
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
    gap: 8,
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
    fontSize: 14,
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
  },  alertSection: {
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
  },  alertSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  stepData: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  stepDataTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDataContent: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
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
});
