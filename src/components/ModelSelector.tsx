import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { modelRouter } from '../services/ai/ModelRouter';
import type { ProviderOption } from '../services/ai/ModelRouter';
import { colors } from '../constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ModelSelector({ visible, onClose }: Props) {
  const [options, setOptions] = useState<ProviderOption[]>([]);
  const [activeId, setActiveId] = useState<string>(modelRouter.getActiveProviderId());
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>(
    (process.env.EXPO_PUBLIC_OLLAMA_ENDPOINT as string) ?? 'http://localhost:11434',
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    modelRouter.getProviderOptions().then((opts) => {
      setOptions(opts);
      setActiveId(modelRouter.getActiveProviderId());
      setLoading(false);
    });
  }, [visible]);

  async function selectProvider(id: string) {
    await modelRouter.setProvider(id);
    setActiveId(id);
    onClose();
  }

  function applyEndpoint() {
    modelRouter.setOllamaEndpoint(ollamaEndpoint.trim());
    setLoading(true);
    modelRouter.getProviderOptions().then((opts) => {
      setOptions(opts);
      setLoading(false);
    });
  }

  const ollamaOptions = options.filter((o) => o.type === 'ollama');
  const cloudOptions = options.filter((o) => o.type !== 'ollama');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Select AI Model</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.section}>Local (Ollama)</Text>

            <View style={styles.endpointRow}>
              <TextInput
                style={styles.endpointInput}
                value={ollamaEndpoint}
                onChangeText={setOllamaEndpoint}
                placeholder="http://localhost:11434"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.applyBtn} onPress={applyEndpoint}>
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
            ) : (
              ollamaOptions.map((opt) => (
                <ProviderRow
                  key={opt.id}
                  option={opt}
                  active={opt.id === activeId}
                  onSelect={selectProvider}
                />
              ))
            )}

            <Text style={[styles.section, { marginTop: 20 }]}>Cloud</Text>
            {cloudOptions.map((opt) => (
              <ProviderRow
                key={opt.id}
                option={opt}
                active={opt.id === activeId}
                onSelect={selectProvider}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ProviderRow({
  option,
  active,
  onSelect,
}: {
  option: ProviderOption;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, active && styles.rowActive]}
      onPress={() => onSelect(option.id)}
      disabled={!option.available}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, !option.available && styles.rowDisabled]}>
          {option.label}
        </Text>
        <Text style={[styles.rowStatus, option.available ? styles.statusOk : styles.statusErr]}>
          {option.available ? '● Connected' : '● Unavailable'}
        </Text>
      </View>
      {active && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: { padding: 4 },
  closeText: { color: colors.textMuted, fontSize: 18 },
  content: { padding: 16 },
  section: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  endpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  endpointInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 13,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  applyText: { color: colors.background, fontWeight: '600', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    marginBottom: 8,
  },
  rowActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  rowLeft: { flex: 1 },
  rowLabel: { color: colors.text, fontSize: 15, fontWeight: '500' },
  rowDisabled: { color: colors.textMuted },
  rowStatus: { fontSize: 11, marginTop: 2 },
  statusOk: { color: colors.success },
  statusErr: { color: colors.error },
  checkmark: { color: colors.primary, fontSize: 18, fontWeight: '700' },
});
