export type DeviceType = 'internet' | 'isp' | 'router' | 'switch' | 'server' | 'pc';

export interface Position {
  x: number;
  y: number;
}

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  position: Position;
  config: DeviceConfig;
  status: 'connected' | 'disconnected';
}

export interface DeviceConfig {
  internalIp?: string;
  wanIp?: string;
  dhcpEnabled?: boolean;
  dhcpRange?: { start: string; end: string };
  natEnabled?: boolean;
  ports?: number[];
  gateway?: string;
  portList?: string[];
}

export interface Cable {
  id: string;
  from: string;
  to: string;
  fromPort: 'top' | 'bottom' | 'left' | 'right';
  toPort: 'top' | 'bottom' | 'left' | 'right';
  type: 'lan' | 'wan' | 'wireless';
  connected: boolean;
}

export interface PacketLog {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  status: 'success' | 'failed';
  reason?: string;
}

export interface NetworkState {
  devices: Device[];
  cables: Cable[];
  logs: PacketLog[];
  stats: {
    packetsDelivered: number;
    packetsDropped: number;
    deviceOnline: number;
    deviceOffline: number;
    portAttempts: number;
  };
}

export interface Cable {
  id: string;
  type: 'lan' | 'wan' | 'wireless';
  from: string; // device ID
  to: string;   // device ID
  connected: boolean;
}