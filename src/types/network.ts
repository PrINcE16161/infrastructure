export type DeviceType = 'internet' | 'proxy' | 'isp' | 'router' | 'switch' | 'server' | 'pc';
export type DeviceStatus = 'connected' | 'disconnected';
export type Direction = 'top' | 'left' | 'right' | 'bottom';
export type CableType = 'lan' | 'wan' | 'wireless';
export type PacketStatus = 'success' | 'failed';
//export type UserRole = 'admin' | 'editor' | 'viewer';

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
  status: DeviceStatus;
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
  fromPort: Direction;
  toPort: Direction;
  type: CableType;
  connected: boolean;
}

export interface PacketLog {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  status: PacketStatus;
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

export interface ConnectionMenuProps {
  position: { x: number; y: number };
  sourceDevice: Device;
  cables: Cable[];
  devices: Device[];
  onConnect: (targetId: string, cableType: CableType, toPort?: Direction) => void;
  onSendPacket: (targetId: string) => void;
  onDisconnect: (targetId: string) => void;
  connectedDevices: string[];
  selectedPort?: Direction;
  selectedDevicePort?: Direction;
}

// export interface User {
//   id: string;
//   name: string;
//   role: UserRole;
//   email: string;
// }