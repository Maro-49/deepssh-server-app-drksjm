
import { Server, AppSettings } from '@/types/server';

let servers: Server[] = [
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

let appSettings: AppSettings = {
  welcomeMessage: '🎉 Welcome to DeepSSH! New servers added. Check them out! 🚀',
  updateNumber: 'v1.0.0',
};

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

export const getServers = () => servers;
export const getAppSettings = () => appSettings;

export const updateServers = (newServers: Server[]) => {
  servers = newServers;
  notifyListeners();
};

export const updateAppSettings = (newSettings: Partial<AppSettings>) => {
  appSettings = { ...appSettings, ...newSettings };
  console.log('App settings updated:', appSettings);
  notifyListeners();
};

export const addServer = (server: Server) => {
  servers = [...servers, server];
  console.log('Server added:', server);
  notifyListeners();
};

export const deleteServer = (id: string) => {
  servers = servers.filter(s => s.id !== id);
  console.log('Server deleted:', id);
  notifyListeners();
};

export const updateServer = (id: string, updatedServer: Partial<Server>) => {
  servers = servers.map(s => s.id === id ? { ...s, ...updatedServer } : s);
  console.log('Server updated:', id, updatedServer);
  notifyListeners();
};
