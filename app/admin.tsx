
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors } from '@/styles/commonStyles';
import {
  getServers,
  getAppSettings,
  updateAppSettings,
  addServer,
  deleteServer,
  updateServer,
  subscribeToDataChanges,
} from '@/data/serversData';
import { Server, AppSettings } from '@/types/server';
import { useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';

const ADMIN_USERNAME = 'maro@@#2008';
const ADMIN_PASSWORD = 'maro@@#2008';

export default function AdminScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [servers, setServers] = useState<Server[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ welcomeMessage: '', updateNumber: '' });
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for new/edit server
  const [formType, setFormType] = useState<'v2ray' | 'websocket' | 'udp'>('v2ray');
  const [formUsername, setFormUsername] = useState('');
  const [formHost, setFormHost] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPort, setFormPort] = useState('');
  const [formIsOnline, setFormIsOnline] = useState(true);
  const [formCustomConfig, setFormCustomConfig] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();

      // Subscribe to data changes
      const unsubscribe = subscribeToDataChanges(() => {
        console.log('Data changed in admin, reloading...');
        loadData();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const loadedServers = await getServers();
      const loadedSettings = await getAppSettings();
      setServers(loadedServers);
      setSettings(loadedSettings);
      console.log('Admin data loaded successfully');
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      Alert.alert('Success', 'Welcome to Admin Panel');
    } else {
      Alert.alert('Error', 'Invalid username or password');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateAppSettings(settings);
      Alert.alert('Success', 'Settings and servers updated successfully! Changes are now persistent.');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddServer = async () => {
    if (!formUsername || !formHost || !formPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newServer: Server = {
      id: Date.now().toString(),
      type: formType,
      username: formUsername,
      host: formHost,
      password: formPassword,
      port: formPort,
      isOnline: formIsOnline,
      customConfig: formCustomConfig,
      createdAt: new Date().toISOString(),
    };

    try {
      setSaving(true);
      await addServer(newServer);
      Alert.alert('Success', 'Server added successfully!');
      // Reset form
      setFormUsername('');
      setFormHost('');
      setFormPassword('');
      setFormPort('');
      setFormCustomConfig('');
      setFormIsOnline(true);
    } catch (error) {
      console.error('Error adding server:', error);
      Alert.alert('Error', 'Failed to add server');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteServer = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this server?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await deleteServer(id);
              Alert.alert('Success', 'Server deleted successfully!');
            } catch (error) {
              console.error('Error deleting server:', error);
              Alert.alert('Error', 'Failed to delete server');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleEditServer = (server: Server) => {
    setEditingServer(server);
    setFormType(server.type);
    setFormUsername(server.username);
    setFormHost(server.host);
    setFormPassword(server.password);
    setFormPort(server.port || '');
    setFormIsOnline(server.isOnline);
    setFormCustomConfig(server.customConfig || '');
    setShowEditModal(true);
  };

  const handleUpdateServer = async () => {
    if (!editingServer) return;

    if (!formUsername || !formHost || !formPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await updateServer(editingServer.id, {
        type: formType,
        username: formUsername,
        host: formHost,
        password: formPassword,
        port: formPort,
        isOnline: formIsOnline,
        customConfig: formCustomConfig,
      });
      Alert.alert('Success', 'Server updated successfully!');
      setShowEditModal(false);
      setEditingServer(null);
      // Reset form
      setFormUsername('');
      setFormHost('');
      setFormPassword('');
      setFormPort('');
      setFormCustomConfig('');
      setFormIsOnline(true);
    } catch (error) {
      console.error('Error updating server:', error);
      Alert.alert('Error', 'Failed to update server');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Admin Login',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Admin Panel</Text>
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Admin Panel',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading admin data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Admin Panel',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <Text style={styles.label}>Welcome Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter welcome message"
            placeholderTextColor={colors.textSecondary}
            value={settings.welcomeMessage}
            onChangeText={(text) => setSettings({ ...settings, welcomeMessage: text })}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.label}>Update Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., v1.0.0"
            placeholderTextColor={colors.textSecondary}
            value={settings.updateNumber}
            onChangeText={(text) => setSettings({ ...settings, updateNumber: text })}
          />
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.disabledButton]} 
            onPress={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={styles.saveButtonText}>Update Settings and Servers</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Add New Server */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Server</Text>
          
          <Text style={styles.label}>Server Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, formType === 'v2ray' && styles.activeTypeButton]}
              onPress={() => setFormType('v2ray')}
            >
              <Text style={[styles.typeButtonText, formType === 'v2ray' && styles.activeTypeButtonText]}>
                V2Ray
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formType === 'websocket' && styles.activeTypeButton]}
              onPress={() => setFormType('websocket')}
            >
              <Text style={[styles.typeButtonText, formType === 'websocket' && styles.activeTypeButtonText]}>
                WebSocket
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formType === 'udp' && styles.activeTypeButton]}
              onPress={() => setFormType('udp')}
            >
              <Text style={[styles.typeButtonText, formType === 'udp' && styles.activeTypeButtonText]}>
                UDP
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor={colors.textSecondary}
            value={formUsername}
            onChangeText={setFormUsername}
          />

          <Text style={styles.label}>Host *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter host"
            placeholderTextColor={colors.textSecondary}
            value={formHost}
            onChangeText={setFormHost}
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor={colors.textSecondary}
            value={formPassword}
            onChangeText={setFormPassword}
          />

          <Text style={styles.label}>Port</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter port"
            placeholderTextColor={colors.textSecondary}
            value={formPort}
            onChangeText={setFormPort}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Custom Config</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter custom config (optional)"
            placeholderTextColor={colors.textSecondary}
            value={formCustomConfig}
            onChangeText={setFormCustomConfig}
            multiline
            numberOfLines={3}
          />

          <View style={styles.statusContainer}>
            <Text style={styles.label}>Server Status</Text>
            <TouchableOpacity
              style={styles.statusToggle}
              onPress={() => setFormIsOnline(!formIsOnline)}
            >
              <View style={[styles.statusIndicator, formIsOnline && styles.statusIndicatorOnline]} />
              <Text style={styles.statusText}>{formIsOnline ? 'Online' : 'Offline'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.addButton, saving && styles.disabledButton]} 
            onPress={handleAddServer}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <>
                <IconSymbol name="add" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Add Server</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Server List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Servers ({servers.length})</Text>
          {servers.map((server) => (
            <View key={server.id} style={styles.serverItem}>
              <View style={styles.serverInfo}>
                <View style={styles.serverHeader}>
                  <Text style={styles.serverType}>{server.type.toUpperCase()}</Text>
                  <View style={[styles.statusBadge, server.isOnline && styles.statusBadgeOnline]}>
                    <Text style={styles.statusBadgeText}>
                      {server.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.serverDetail}>Username: {server.username}</Text>
                <Text style={styles.serverDetail}>Host: {server.host}</Text>
                <Text style={styles.serverDetail}>Port: {server.port || 'N/A'}</Text>
              </View>
              <View style={styles.serverActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditServer(server)}
                  disabled={saving}
                >
                  <IconSymbol name="edit" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteServer(server.id)}
                  disabled={saving}
                >
                  <IconSymbol name="delete" size={20} color={colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Edit Server Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Server</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <IconSymbol name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Server Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, formType === 'v2ray' && styles.activeTypeButton]}
                  onPress={() => setFormType('v2ray')}
                >
                  <Text style={[styles.typeButtonText, formType === 'v2ray' && styles.activeTypeButtonText]}>
                    V2Ray
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, formType === 'websocket' && styles.activeTypeButton]}
                  onPress={() => setFormType('websocket')}
                >
                  <Text style={[styles.typeButtonText, formType === 'websocket' && styles.activeTypeButtonText]}>
                    WebSocket
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, formType === 'udp' && styles.activeTypeButton]}
                  onPress={() => setFormType('udp')}
                >
                  <Text style={[styles.typeButtonText, formType === 'udp' && styles.activeTypeButtonText]}>
                    UDP
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor={colors.textSecondary}
                value={formUsername}
                onChangeText={setFormUsername}
              />

              <Text style={styles.label}>Host *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter host"
                placeholderTextColor={colors.textSecondary}
                value={formHost}
                onChangeText={setFormHost}
              />

              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                value={formPassword}
                onChangeText={setFormPassword}
              />

              <Text style={styles.label}>Port</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter port"
                placeholderTextColor={colors.textSecondary}
                value={formPort}
                onChangeText={setFormPort}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Custom Config</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter custom config (optional)"
                placeholderTextColor={colors.textSecondary}
                value={formCustomConfig}
                onChangeText={setFormCustomConfig}
                multiline
                numberOfLines={3}
              />

              <View style={styles.statusContainer}>
                <Text style={styles.label}>Server Status</Text>
                <TouchableOpacity
                  style={styles.statusToggle}
                  onPress={() => setFormIsOnline(!formIsOnline)}
                >
                  <View style={[styles.statusIndicator, formIsOnline && styles.statusIndicatorOnline]} />
                  <Text style={styles.statusText}>{formIsOnline ? 'Online' : 'Offline'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.updateButton, saving && styles.disabledButton]} 
                onPress={handleUpdateServer}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={styles.updateButtonText}>Update Server</Text>
                )}
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
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTypeButtonText: {
    color: colors.background,
  },
  statusContainer: {
    marginTop: 12,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.textSecondary,
  },
  statusIndicatorOnline: {
    backgroundColor: colors.secondary,
  },
  statusText: {
    fontSize: 16,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  disabledButton: {
    opacity: 0.6,
  },
  serverItem: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  serverInfo: {
    flex: 1,
  },
  serverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  serverType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.textSecondary + '30',
  },
  statusBadgeOnline: {
    backgroundColor: colors.secondary + '30',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  serverDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  serverActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '30',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalScroll: {
    padding: 16,
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
