
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import ServerCard from '@/components/ServerCard';
import { servers, appSettings } from '@/data/serversData';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'v2ray' | 'websocket' | 'udp'>('v2ray');

  const filteredServers = servers.filter(server => server.type === selectedTab);

  const openTelegram = async () => {
    const telegramUrl = 'https://t.me/Deepsshnet';
    try {
      const supported = await Linking.canOpenURL(telegramUrl);
      if (supported) {
        await Linking.openURL(telegramUrl);
      } else {
        Alert.alert('Error', 'Cannot open Telegram link');
      }
    } catch (error) {
      console.log('Error opening Telegram:', error);
      Alert.alert('Error', 'Failed to open Telegram link');
    }
  };

  const goToAdmin = () => {
    router.push('/admin');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'DeepSSH',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerRight: () => (
            <TouchableOpacity onPress={goToAdmin} style={styles.adminButton}>
              <IconSymbol name="gear" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>{appSettings.welcomeMessage}</Text>
        <Text style={styles.updateText}>Update: {appSettings.updateNumber}</Text>
      </View>

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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredServers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="exclamationmark.triangle" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No servers available</Text>
          </View>
        ) : (
          filteredServers.map(server => (
            <ServerCard key={server.id} server={server} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.telegramButton} onPress={openTelegram}>
        <IconSymbol name="paperplane.fill" size={20} color={colors.text} />
        <Text style={styles.telegramButtonText}>Join our Telegram Channel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  adminButton: {
    marginRight: 16,
    padding: 4,
  },
  welcomeContainer: {
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  welcomeText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  updateText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
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
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  telegramButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 4px 12px rgba(255, 64, 129, 0.4)',
    elevation: 6,
  },
  telegramButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
