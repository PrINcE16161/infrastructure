import { Device, Cable, PacketLog } from '../types/network';

const isInSameSubnet = (ip1: string, ip2: string): boolean => {
  const parts1 = ip1.split('.');
  const parts2 = ip2.split('.');
  return parts1[0] === parts2[0] && parts1[1] === parts2[1] && parts1[2] === parts2[2];
};

const findPath = (
  fromId: string,
  toId: string,
  devices: Device[],
  cables: Cable[]
): string[] | null => {
  const visited = new Set<string>();
  const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.id === toId) {
      return current.path;
    }

    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const connectedCables = cables.filter(
      cable => cable.connected && (cable.from === current.id || cable.to === current.id)
    );

    for (const cable of connectedCables) {
      const nextId = cable.from === current.id ? cable.to : cable.from;
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, path: [...current.path, nextId] });
      }
    }
  }

  return null;
};

const getDeviceIp = (device: Device): string => {
  switch (device.type) {

    case "pc":
    case "server":
    case "router":
      return device.config.internalIp || device.config.wanIp || "";

    case "proxy":
      return device.config.ipAddress || "";

    case "isp":
      return device.config.wanIp || "";

    case "internet":
      return "0.0.0.0"; // special, always reachable

    default:
      return "";
  }
};

export const simulatePacket = (
  fromId: string,
  toId: string,
  devices: Device[],
  cables: Cable[]
): { success: boolean; reason?: string; path: string[] } => {
  const fromDevice = devices.find(d => d.id === fromId);
  const toDevice = devices.find(d => d.id === toId);

  if (!fromDevice || !toDevice) {
    return { success: false, reason: 'Device not found', path: [] };
  }

  if (fromDevice.status === 'disconnected' || toDevice.status === 'disconnected') {
    return { success: false, reason: 'Device offline', path: [] };
  }

  const path = findPath(fromId, toId, devices, cables);

  if (!path) {
    return { success: false, reason: 'No route to host', path: [] };
  }

  const fromIp = getDeviceIp(fromDevice);
  const toIp = getDeviceIp(toDevice);

  if (!fromIp || !toIp) {
    return { success: false, reason: 'IP not configured', path };
  }

  if (fromDevice.type === "internet") {
    if (toDevice.type === "proxy") {
      const proxyIp = toDevice.config.ipAddress;

      if (!proxyIp) {
        return { success: false, reason: "Proxy has no IP address", path };
      }

      const nsRecord = toDevice.config.ns1 && toDevice.config.ns2;

      if(!nsRecord) {
        return { success: false, reason: "Proxy has no DNS Record", path };
      }

      return { success: true, path };
    }

    if (!toIp) {
      return { success: false, reason: "Destination has no IP address", path };
    }

    return { success: true, path };
  }

  if (toDevice.type === 'server' && toDevice.config.ports) {
    if (toDevice.config.ports.length === 0) {
      return { success: false, reason: 'All ports closed', path };
    }
  }

  const needsRouter = !isInSameSubnet(fromIp, toIp);

  if (needsRouter) {
    const hasRouter = path.some(deviceId => {
      const device = devices.find(d => d.id === deviceId);
      return device?.type === 'router';
    });

    if (!hasRouter) {
      return { success: false, reason: 'Router required for different subnets', path };
    }
  }

  const ispDevice = devices.find(d => d.type === 'isp');
  if (ispDevice && path.includes(ispDevice.id)) {
    if (ispDevice.status === 'disconnected') {
      return { success: false, reason: 'ISP down', path };
    }
  }

  return { success: true, path };
};

export const createPacketLog = (
  from: string,
  to: string,
  success: boolean,
  reason?: string
): PacketLog => ({
  id: `log-${Date.now()}-${Math.random()}`,
  timestamp: Date.now(),
  from,
  to,
  status: success ? 'success' : 'failed',
  reason
});
