
export interface Server {
  id: string;
  type: 'v2ray' | 'websocket' | 'udp';
  username: string;
  host: string;
  password: string;
  port?: string;
  isOnline: boolean;
  customConfig?: string;
  createdAt: string;
}

export interface AppSettings {
  welcomeMessage: string;
  updateNumber: string;
}
