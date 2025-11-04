
import { getServers, getAppSettings, subscribeToDataChanges } from '@/data/serversData';
import React, { useState, useEffect } from 'react';
import { colors } from '@/styles/commonStyles';
import ServerCard from '@/components/ServerCard';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { Server, AppSettings } from '@/types/server';

export default function HomeScreen() {
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ welcomeMessage: '', updateNumber: '' });
  const [selectedTab, setSelectedTab] = useState<'v2ray' | 'websocket' | 'udp'>('v2ray');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Subscribe to data changes
    const unsubscribe = subscribeToDataChanges(() => {
      console.log('Data changed, reloading...');
      loadData();
    });

    return unsubscribe;
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const loadedServers = await getServers();
      const loadedSettings = await getAppSettings();
      setServers(loadedServers);
      setSettings(loadedSettings);
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTelegram = () => {
    Linking.openURL('https://t.me/Deepsshnet').catch(err => {
      console.error('Failed to open Telegram link:', err);
      Alert.alert('Error', 'Could not open Telegram link');
    });
  };

  const goToAdmin = () => {
    router.push('/admin');
  };

  const filteredServers = servers.filter(server => server.type === selectedTab);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'DeepSSH',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerRight: () => (
              <TouchableOpacity onPress={goToAdmin} style={styles.adminButton}>
                <IconSymbol name="settings" size={24} color={colors.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading servers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'DeepSSH',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={goToAdmin} style={styles.adminButton}>
              <IconSymbol name="settings" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeMessage}>{settings.welcomeMessage}</Text>
          <Text style={styles.updateNumber}>Update: {settings.updateNumber}</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'v2ray' && styles.activeTab]}
            onPress={() => setSelectedTab('v2ray')}
          >
            <Text style={[styles.tabText, selectedTab === 'v2ray' && styles.activeTabText]}>
              V2Ray
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'websocket' && styles.activeTab]}
            onPress={() => setSelectedTab('websocket')}
          >
            <Text style={[styles.tabText, selectedTab === 'websocket' && styles.activeTabText]}>
              WebSocket
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'udp' && styles.activeTab]}
            onPress={() => setSelectedTab('udp')}
          >
            <Text style={[styles.tabText, selectedTab === 'udp' && styles.activeTabText]}>
              UDP Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Server List */}
        <View style={styles.serverList}>
          {filteredServers.length > 0 ? (
            filteredServers.map(server => (
              <ServerCard key={server.id} server={server} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="cloud-off" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No {selectedTab} servers available</Text>
            </View>
          )}
        </View>

        {/* Telegram Button */}
        <TouchableOpacity style={styles.telegramButton} onPress={openTelegram}>
          <IconSymbol name="send" size={20} color={colors.background} />
          <Text style={styles.telegramButtonText}>Join our Telegram Channel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  adminButton: {
    marginRight: 16,
    padding: 8,
  },
  welcomeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  welcomeMessage: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  updateNumber: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.background,
  },
  serverList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  telegramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  telegramButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
