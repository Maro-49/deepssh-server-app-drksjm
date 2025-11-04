
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Server } from '@/types/server';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface ServerCardProps {
  server: Server;
}

export default function ServerCard({ server }: ServerCardProps) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('✅ Copied!', `${label} copied to clipboard`);
    } catch (error) {
      console.log('Error copying to clipboard:', error);
      Alert.alert('❌ Error', 'Failed to copy to clipboard');
    }
  };

  const copyAllInfo = async () => {
    const allInfo = `
DeepSSH Server Info
==================
Type: ${server.type.toUpperCase()}
Username: ${server.username}
Host: ${server.host}
Password: ${server.password}
Port: ${server.port || 'N/A'}
Status: ${server.isOnline ? 'Online ✅' : 'Offline ❌'}
==================
    `.trim();
    
    await copyToClipboard(allInfo, 'All server info');
  };

  const copyCustomConfig = async () => {
    if (server.customConfig) {
      await copyToClipboard(server.customConfig, 'Custom config');
    } else {
      Alert.alert('⚠️ No Config', 'No custom configuration available for this server');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>{server.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: server.isOnline ? colors.success : colors.error }]}>
          <Text style={styles.statusText}>{server.isOnline ? '● Online' : '● Offline'}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Username:</Text>
          <TouchableOpacity onPress={() => copyToClipboard(server.username, 'Username')}>
            <Text style={styles.value}>{server.username}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Host:</Text>
          <TouchableOpacity onPress={() => copyToClipboard(server.host, 'Host')}>
            <Text style={styles.value}>{server.host}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Password:</Text>
          <TouchableOpacity onPress={() => copyToClipboard(server.password, 'Password')}>
            <Text style={styles.value}>{'•'.repeat(server.password.length)}</Text>
          </TouchableOpacity>
        </View>

        {server.port && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Port:</Text>
            <TouchableOpacity onPress={() => copyToClipboard(server.port!, 'Port')}>
              <Text style={styles.value}>{server.port}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.copyButton} onPress={copyAllInfo}>
          <IconSymbol name="doc.on.doc" size={18} color={colors.text} />
          <Text style={styles.copyButtonText}>Copy All Info</Text>
        </TouchableOpacity>

        {server.customConfig && (
          <TouchableOpacity style={[styles.copyButton, styles.customConfigButton]} onPress={copyCustomConfig}>
            <IconSymbol name="link" size={18} color={colors.text} />
            <Text style={styles.copyButtonText}>Copy Config</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  copyButton: {
    flex: 1,
    backgroundColor: colors.highlight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  customConfigButton: {
    backgroundColor: colors.secondary,
  },
  copyButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
