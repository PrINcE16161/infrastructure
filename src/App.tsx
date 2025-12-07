import { useState, useEffect, useCallback } from 'react';
import { Device, Cable, NetworkState, DeviceType, User } from './types/network';
import { saveNetworkState, loadNetworkState, loadAuthToken, saveAuthToken, clearAuthToken } from './utils/storage';
import { simulatePacket, createPacketLog } from './utils/packetSimulation';
import DeviceNode from './components/DeviceNode';
import DeviceConfig from './components/DeviceConfig';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import Dashboard from './components/Dashboard';
import ConnectionMenu from './components/ConnectionMenu';
import Login from './components/Login';

function App() {
  const [state, setState] = useState<NetworkState>({
    devices: [],
    cables: [],
    logs: [],
    stats: {
      packetsDelivered: 0,
      packetsDropped: 0,
      deviceOnline: 0,
      deviceOffline: 0,
      portAttempts: 0
    }
  });
  const [user, setUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [connectionMenu, setConnectionMenu] = useState<{
    device: Device;
    position: { x: number; y: number };
  } | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [draggingDevice, setDraggingDevice] = useState<string | null>(null);
  const [animatingPath, setAnimatingPath] = useState<string[]>([]);
  const [animationSuccess, setAnimationSuccess] = useState(false);
  
  useEffect(() => {
    if (animatingPath.length < 2) return;

    let start = performance.now();
    const duration = 2500;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setAnimationProgress(t);

      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [animatingPath]);

  useEffect(() => {
    const token = loadAuthToken();
    if (token) {
      const email = atob(token.split('.')[0]);
      setUser({ id: token, email });
    }
  }, []);

  const handleLogin = (email: string) => {
    const token = btoa(email) + '.' + Date.now();
    saveAuthToken(token);
    setUser({ id: token, email });
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setState({
      devices: [],
      cables: [],
      logs: [],
      stats: {
        packetsDelivered: 0,
        packetsDropped: 0,
        deviceOnline: 0,
        deviceOffline: 0,
        portAttempts: 0
      },
    });
  };

  useEffect(() => {
    const saved = loadNetworkState();
    if (saved) {
      setState(saved);
    }
  }, []);

  useEffect(() => {
    saveNetworkState(state);
  }, [state]);

  useEffect(() => {
    const online = state.devices.filter(d => d.status === 'connected').length;
    const offline = state.devices.filter(d => d.status === 'disconnected').length;
    setState(prev => ({
      ...prev,
      stats: { ...prev.stats, deviceOnline: online, deviceOffline: offline }
    }));
  }, [state.devices]);

  const addDevice = useCallback((type: DeviceType) => {
    const count = state.devices.filter(d => d.type === type).length;
    const newDevice: Device = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type.toUpperCase()}-${count + 1}`,
      position: { x: 300 + Math.random() * 400, y: 200 + Math.random() * 300 },
      config: {},
      status: 'connected'
    };
    setState(prev => ({ ...prev, devices: [...prev.devices, newDevice] }));
  }, [state.devices]);

  const updateDevice = useCallback((deviceId: string, updates: Partial<Device>) => {
    setState(prev => ({
      ...prev,
      devices: prev.devices.map(d => {
        if (d.id !== deviceId) return d;

        return {
          ...d,
          ...updates,
          config: updates.config !== undefined 
            ? { ...d.config, ...updates.config }
            : d.config
        };
      })
    }));
    
    // Update selectedDevice if it's the one being updated
    setSelectedDevice(prev => {
      if (prev?.id === deviceId) {
        return {
          ...prev,
          ...updates,
          config: updates.config !== undefined 
            ? { ...prev.config, ...updates.config }
            : prev.config
        };
      }
      return prev;
    });
  }, []);

  const deleteDevice = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      devices: prev.devices.filter(d => d.id !== id),
      cables: prev.cables.filter(c => c.from !== id && c.to !== id)
    }));
    setSelectedDevice(null);
  }, []);

  const [connecting, setConnecting] = useState<{
    deviceId: string;
    port: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);


  const addCable = useCallback((
      from: string,
      to: string,
      type: 'lan'|'wan'|'wireless',
      fromPort: 'top'|'bottom'|'left'|'right',
      toPort: 'top'|'bottom'|'left'|'right'
    ) => {
      const exists = state.cables.some(
        c =>
          (c.from === from && c.to === to) ||
          (c.from === to && c.to === from)
      );

      if (!exists) {
        const newCable: Cable = {
          id: `cable-${Date.now()}`,
          from,
          to,
          fromPort,
          toPort,
          type,
          connected: true
        };

        setState(prev => ({
          ...prev,
          cables: [...prev.cables, newCable]
        }));
      }

      setConnecting(null);
    },
    [state.cables]
  );

  const computeClosestPort = useCallback((fromDevice: Device, toDevice: Device) : 'top'|'bottom'|'left'|'right' => {
    const dx = toDevice.position.x - fromDevice.position.x;
    const dy = toDevice.position.y - fromDevice.position.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // if horizontal distance is larger -> left/right
    if (absDx > absDy) {
      return dx > 0 ? 'left' : 'right'; // if target is to the right, use target's left port
    } else {
      return dy > 0 ? 'top' : 'bottom'; // if target is below, use target's top port
    }
  }, []);

  const handleConnectionPointClick = useCallback(
    (deviceId: string, port: 'top' | 'bottom' | 'left' | 'right', e?: React.MouseEvent) => {
      const dev = state.devices.find(d => d.id === deviceId);
      if (!dev) return;

      const pos = e
        ? { x: e.clientX, y: e.clientY }
        : { x: dev.position.x, y: dev.position.y };

      // store only device + port
      setConnecting({ deviceId, port });

      // show menu at click position
      setConnectionMenu({ device: dev, position: pos });
    },
    [state.devices]
  );

  const removeCable = useCallback((from: string, to: string) => {
    setState(prev => ({
      ...prev,
      cables: prev.cables.filter(
        c => !((c.from === from && c.to === to) || (c.from === to && c.to === from))
      )
    }));
  }, []);

  const sendPacket = useCallback((from: string, to: string) => {
    setState(prev => ({ ...prev, stats: { ...prev.stats, portAttempts: prev.stats.portAttempts + 1 } }));

    const result = simulatePacket(from, to, state.devices, state.cables);
    const log = createPacketLog(from, to, result.success, result.reason);

    setState(prev => ({
      ...prev,
      logs: [...prev.logs, log],
      stats: {
        ...prev.stats,
        packetsDelivered: result.success
          ? prev.stats.packetsDelivered + 1
          : prev.stats.packetsDelivered,
        packetsDropped: !result.success
          ? prev.stats.packetsDropped + 1
          : prev.stats.packetsDropped
      }
    }));

    setAnimatingPath(result.path);
    setAnimationSuccess(result.success);

    setTimeout(() => {
      setAnimatingPath([]);
    }, 2000);

    setConnectionMenu(null);
  }, [state.devices, state.cables]);

  const handleDeviceDrag = useCallback((deviceId: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      devices: prev.devices.map(d =>
        d.id === deviceId ? { ...d, position: { x, y } } : d
      )
    }));
  }, []);

  const clearAll = useCallback(() => {
    if (confirm('Clear all devices and connections?')) {
      setState({
        devices: [],
        cables: [],
        logs: [],
        stats: {
          packetsDelivered: 0,
          packetsDropped: 0,
          deviceOnline: 0,
          deviceOffline: 0,
          portAttempts: 0
        }
      });
    }
  }, []);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network-topology.json';
    link.click();
  }, [state]);

  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            setState(imported);
          } catch (error) {
            alert('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const getConnectedDevices = useCallback((deviceId: string): string[] => {
    return state.cables
      .filter(c => c.from === deviceId || c.to === deviceId)
      .map(c => (c.from === deviceId ? c.to : c.from));
  }, [state.cables]);

  const [showPanel, setShowPanel] = useState(true);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
      <Toolbar
        onAddDevice={addDevice}
        onClearAll={clearAll}
        onExport={exportData}
        onImport={importData}
        onLogout={handleLogout}
        showPanel={showPanel}
        setShowPanel={setShowPanel}
      />

      <div
        className="w-full h-screen relative"
        onClick={() => {
          setSelectedDevice(null);
          setConnectionMenu(null);
          setConnecting(null);
        }}
      >
        <Canvas
          devices={state.devices}
          cables={state.cables}
          animatingPath={animatingPath}
          animationProgress={animationProgress}
          animationSuccess={animationSuccess}
        />

        {state.devices.map(device => (
          <DeviceNode
            key={device.id}
            device={device}
            isSelected={selectedDevice?.id === device.id}
            onDragStart={(e, d) => { setDraggingDevice(d.id); e.dataTransfer.effectAllowed = 'move'; }}
            onDrag={(e) => { if (draggingDevice && e.clientX > 0 && e.clientY > 0) handleDeviceDrag(draggingDevice, e.clientX, e.clientY); }}
            onDragEnd={() => setDraggingDevice(null)}
            onClick={() => setSelectedDevice(device)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setConnectionMenu({ device, position: { x: e.clientX, y: e.clientY } }); }}
            onConnectionPointClick={(devId, port) => handleConnectionPointClick(devId, port)}
            connectingFrom={connecting ? `${connecting.deviceId}-${connecting.port}` : null}
          />
        ))}
      </div>

      {selectedDevice && (
        <DeviceConfig
          device={selectedDevice}
          onUpdate={updateDevice}
          onClose={() => setSelectedDevice(null)}
          onDelete={() => deleteDevice(selectedDevice.id)}
        />
      )}

      {connectionMenu && (
        <ConnectionMenu key={Date.now()}
          position={connectionMenu.position}
          sourceDevice={connectionMenu.device}
          cables={state.cables}
          devices={state.devices}
          onConnect={(targetId, cableType, userChosenToPort) => {
          if (connecting) {
            const fromPort = connecting.port;
            const toPort = userChosenToPort ??
              computeClosestPort(
                state.devices.find(d => d.id === connecting.deviceId)!,
                state.devices.find(d => d.id === targetId)!
              );

            addCable(connecting.deviceId, targetId, cableType, fromPort, toPort);
          } else {
            const fromPort = 'right';
            const toPort = userChosenToPort ?? 'left';
            addCable(connectionMenu.device.id, targetId, cableType, fromPort, toPort);
          }

          setConnectionMenu(null);
          setConnecting(null);
        }}
          onSendPacket={(targetId) => sendPacket(connectionMenu.device.id, targetId)}
          onDisconnect={(targetId) => removeCable(connectionMenu.device.id, targetId)}
          connectedDevices={getConnectedDevices(connectionMenu.device.id)}
        />
      )}

      <Dashboard stats={state.stats} logs={state.logs} />
    </div>
  );
}

export default App;
