
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Server, AppSettings } from '@/types/server';

const SERVERS_STORAGE_KEY = '@deepssh_servers';
const SETTINGS_STORAGE_KEY = '@deepssh_settings';

// Default data
const defaultServers: Server[] = [
  {
    id: '1',
    type: 'v2ray',
    username: 'demo_user_v2ray',
    host: 'v2ray.deepssh.net',
    password: 'demo_pass_123',
    port: '443',
    isOnline: true,
    customConfig: 'vmess://eyJhZGQiOiJ2MnJheS5kZWVwc3NoLm5ldCIsImFpZCI6IjAiLCJob3N0IjoiIiwiaWQiOiJkZW1vX3VzZXJfdjJyYXkiLCJuZXQiOiJ3cyIsInBhdGgiOiIvIiwicG9ydCI6IjQ0MyIsInBzIjoiRGVlcFNTSCBWMlJheSIsInRscyI6InRscyIsInR5cGUiOiJub25lIiwidiI6IjIifQ==',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'v2ray',
    username: 'demo_user_v2ray_2',
    host: 'v2ray2.deepssh.net',
    password: 'demo_pass_456',
    port: '8443',
    isOnline: false,
    customConfig: 'vmess://eyJhZGQiOiJ2MnJheTIuZGVlcHNzaC5uZXQiLCJhaWQiOiIwIiwiaG9zdCI6IiIsImlkIjoiZGVtb191c2VyX3YycmF5XzIiLCJuZXQiOiJ3cyIsInBhdGgiOiIvIiwicG9ydCI6Ijg0NDMiLCJwcyI6IkRlZXBTU0ggVjJSYXkgMiIsInRscyI6InRscyIsInR5cGUiOiJub25lIiwidiI6IjIifQ==',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'websocket',
    username: 'ws_demo_user',
    host: 'ws.deepssh.net',
    password: 'ws_pass_789',
    port: '80',
    isOnline: true,
    customConfig: 'ws://ws.deepssh.net:80?user=ws_demo_user&pass=ws_pass_789',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'websocket',
    username: 'ws_demo_user_2',
    host: 'ws2.deepssh.net',
    password: 'ws_pass_012',
    port: '8080',
    isOnline: true,
    customConfig: 'ws://ws2.deepssh.net:8080?user=ws_demo_user_2&pass=ws_pass_012',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    type: 'udp',
    username: 'udp_demo_user',
    host: 'udp.deepssh.net',
    password: 'udp_pass_345',
    port: '7300',
    isOnline: true,
    customConfig: 'udp://udp.deepssh.net:7300#user=udp_demo_user&pass=udp_pass_345',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    type: 'udp',
    username: 'udp_demo_user_2',
    host: 'udp2.deepssh.net',
    password: 'udp_pass_678',
    port: '7301',
    isOnline: false,
    customConfig: 'udp://udp2.deepssh.net:7301#user=udp_demo_user_2&pass=udp_pass_678',
    createdAt: new Date().toISOString(),
  },
];

const defaultSettings: AppSettings = {
  welcomeMessage: '🎉 Welcome to DeepSSH! New servers added. Check them out! 🚀',
  updateNumber: 'v1.0.0',
};

// In-memory cache
let servers: Server[] = [...defaultServers];
let appSettings: AppSettings = { ...defaultSettings };
let isInitialized = false;

// Event listeners for data changes
type DataChangeListener = () => void;
const listeners: DataChangeListener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const subscribeToDataChanges = (listener: DataChangeListener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Load data from AsyncStorage
export const loadData = async () => {
  try {
    console.log('Loading data from AsyncStorage...');
    
    // Load servers
    const serversJson = await AsyncStorage.getItem(SERVERS_STORAGE_KEY);
    if (serversJson) {
      servers = JSON.parse(serversJson);
      console.log('Servers loaded from storage:', servers.length, 'servers');
    } else {
      console.log('No stored servers found, using defaults');
      servers = [...defaultServers];
      // Save defaults to storage
      await saveServers();
    }

    // Load settings
    const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (settingsJson) {
      appSettings = JSON.parse(settingsJson);
      console.log('Settings loaded from storage:', appSettings);
    } else {
      console.log('No stored settings found, using defaults');
      appSettings = { ...defaultSettings };
      // Save defaults to storage
      await saveSettings();
    }

    isInitialized = true;
    notifyListeners();
  } catch (error) {
    console.error('Error loading data from AsyncStorage:', error);
    // Fallback to defaults on error
    servers = [...defaultServers];
    appSettings = { ...defaultSettings };
    isInitialized = true;
  }
};

// Save servers to AsyncStorage
const saveServers = async () => {
  try {
    const serversJson = JSON.stringify(servers);
    await AsyncStorage.setItem(SERVERS_STORAGE_KEY, serversJson);
    console.log('Servers saved to storage');
  } catch (error) {
    console.error('Error saving servers to AsyncStorage:', error);
  }
};

// Save settings to AsyncStorage
const saveSettings = async () => {
  try {
    const settingsJson = JSON.stringify(appSettings);
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, settingsJson);
    console.log('Settings saved to storage');
  } catch (error) {
    console.error('Error saving settings to AsyncStorage:', error);
  }
};

// Initialize data on first access
const ensureInitialized = async () => {
  if (!isInitialized) {
    await loadData();
  }
};

// Public API
export const getServers = async (): Promise<Server[]> => {
  await ensureInitialized();
  return servers;
};

export const getAppSettings = async (): Promise<AppSettings> => {
  await ensureInitialized();
  return appSettings;
};

export const updateServers = async (newServers: Server[]) => {
  servers = newServers;
  await saveServers();
  notifyListeners();
};

export const updateAppSettings = async (newSettings: Partial<AppSettings>) => {
  appSettings = { ...appSettings, ...newSettings };
  console.log('App settings updated:', appSettings);
  await saveSettings();
  notifyListeners();
};

export const addServer = async (server: Server) => {
  servers = [...servers, server];
  console.log('Server added:', server);
  await saveServers();
  notifyListeners();
};

export const deleteServer = async (id: string) => {
  servers = servers.filter(s => s.id !== id);
  console.log('Server deleted:', id);
  await saveServers();
  notifyListeners();
};

export const updateServer = async (id: string, updatedServer: Partial<Server>) => {
  servers = servers.map(s => s.id === id ? { ...s, ...updatedServer } : s);
  console.log('Server updated:', id, updatedServer);
  await saveServers();
  notifyListeners();
};

// Clear all data (useful for debugging)
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(SERVERS_STORAGE_KEY);
    await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
    servers = [...defaultServers];
    appSettings = { ...defaultSettings };
    console.log('All data cleared, reset to defaults');
    notifyListeners();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
