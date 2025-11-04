
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import {
  servers,
  appSettings,
  updateAppSettings,
  addServer,
  deleteServer,
  updateServer,
} from '@/data/serversData';
import { Server } from '@/types/server';

const ADMIN_USERNAME = 'maro@@#2008';
const ADMIN_PASSWORD = 'maro@@#2008';

export default function AdminScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState(appSettings.welcomeMessage);
  const [updateNumber, setUpdateNumber] = useState(appSettings.updateNumber);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);

  const [newServer, setNewServer] = useState<Partial<Server>>({
    type: 'v2ray',
    username: '',
    host: '',
    password: '',
    port: '',
    isOnline: true,
    customConfig: '',
  });

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      Alert.alert('✅ Success', 'Welcome to Admin Panel!');
    } else {
      Alert.alert('❌ Error', 'Invalid username or password');
    }
  };

  const handleSaveSettings = () => {
    updateAppSettings({
      welcomeMessage,
      updateNumber,
    });
    Alert.alert('✅ Saved', 'Settings updated successfully!');
  };

  const handleAddServer = () => {
    if (!newServer.username || !newServer.host || !newServer.password) {
      Alert.alert('⚠️ Error', 'Please fill in all required fields');
      return;
    }

    const server: Server = {
      id: Date.now().toString(),
      type: newServer.type as 'v2ray' | 'websocket' | 'udp',
      username: newServer.username,
      host: newServer.host,
      password: newServer.password,
      port: newServer.port,
      isOnline: newServer.isOnline ?? true,
      customConfig: newServer.customConfig,
      createdAt: new Date().toISOString(),
    };

    addServer(server);
    setShowAddModal(false);
    setNewServer({
      type: 'v2ray',
      username: '',
      host: '',
      password: '',
      port: '',
      isOnline: true,
      customConfig: '',
    });
    Alert.alert('✅ Success', 'Server added successfully!');
  };

  const handleDeleteServer = (id: string) => {
    Alert.alert(
      '⚠️ Confirm Delete',
      'Are you sure you want to delete this server?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteServer(id);
            Alert.alert('✅ Deleted', 'Server deleted successfully!');
          },
        },
      ]
    );
  };

  const handleEditServer = (server: Server) => {
    setEditingServer(server);
    setNewServer(server);
    setShowAddModal(true);
  };

  const handleUpdateServer = () => {
    if (!editingServer || !newServer.username || !newServer.host || !newServer.password) {
      Alert.alert('⚠️ Error', 'Please fill in all required fields');
      return;
    }

    updateServer(editingServer.id, newServer);
    setShowAddModal(false);
    setEditingServer(null);
    setNewServer({
      type: 'v2ray',
      username: '',
      host: '',
      password: '',
      port: '',
      isOnline: true,
      customConfig: '',
    });
    Alert.alert('✅ Updated', 'Server updated successfully!');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Admin Login',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={24} color={colors.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loginContainer}>
          <IconSymbol name="lock.shield" size={64} color={colors.primary} />
          <Text style={styles.loginTitle}>Admin Access</Text>
          <Text style={styles.loginSubtitle}>Enter your credentials to continue</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Admin Panel',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <Text style={styles.label}>Welcome Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter welcome message..."
            placeholderTextColor={colors.textSecondary}
            value={welcomeMessage}
            onChangeText={setWelcomeMessage}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Update Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., v1.0.0"
            placeholderTextColor={colors.textSecondary}
            value={updateNumber}
            onChangeText={setUpdateNumber}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.text} />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manage Servers</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setEditingServer(null);
                setNewServer({
                  type: 'v2ray',
                  username: '',
                  host: '',
                  password: '',
                  port: '',
                  isOnline: true,
                  customConfig: '',
                });
                setShowAddModal(true);
              }}
            >
              <IconSymbol name="plus.circle.fill" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          {servers.map(server => (
            <View key={server.id} style={styles.serverCard}>
              <View style={styles.serverHeader}>
                <Text style={styles.serverType}>{server.type.toUpperCase()}</Text>
                <View style={styles.serverActions}>
                  <TouchableOpacity onPress={() => handleEditServer(server)}>
                    <IconSymbol name="pencil" size={20} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteServer(server.id)}>
                    <IconSymbol name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.serverInfo}>Host: {server.host}</Text>
              <Text style={styles.serverInfo}>User: {server.username}</Text>
              <Text style={styles.serverInfo}>
                Status: {server.isOnline ? '✅ Online' : '❌ Offline'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingServer ? 'Edit Server' : 'Add New Server'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Server Type</Text>
              <View style={styles.typeSelector}>
                {(['v2ray', 'websocket', 'udp'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newServer.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewServer({ ...newServer, type })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newServer.type === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor={colors.textSecondary}
                value={newServer.username}
                onChangeText={text => setNewServer({ ...newServer, username: text })}
              />

              <Text style={styles.label}>Host *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter host"
                placeholderTextColor={colors.textSecondary}
                value={newServer.host}
                onChangeText={text => setNewServer({ ...newServer, host: text })}
              />

              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                value={newServer.password}
                onChangeText={text => setNewServer({ ...newServer, password: text })}
                secureTextEntry
              />

              <Text style={styles.label}>Port</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter port"
                placeholderTextColor={colors.textSecondary}
                value={newServer.port}
                onChangeText={text => setNewServer({ ...newServer, port: text })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Custom Config (Ready-to-copy)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter custom configuration..."
                placeholderTextColor={colors.textSecondary}
                value={newServer.customConfig}
                onChangeText={text => setNewServer({ ...newServer, customConfig: text })}
                multiline
                numberOfLines={4}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Server Online</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    newServer.isOnline && styles.switchActive,
                  ]}
                  onPress={() =>
                    setNewServer({ ...newServer, isOnline: !newServer.isOnline })
                  }
                >
                  <View
                    style={[
                      styles.switchThumb,
                      newServer.isOnline && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={editingServer ? handleUpdateServer : handleAddServer}
              >
                <Text style={styles.modalButtonText}>
                  {editingServer ? 'Update Server' : 'Add Server'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginLeft: 16,
    padding: 4,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  loginButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
  },
  serverCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  serverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serverType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  serverActions: {
    flexDirection: 'row',
    gap: 16,
  },
  serverInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalScroll: {
    maxHeight: 500,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.highlight,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: colors.text,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.highlight,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: colors.success,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
