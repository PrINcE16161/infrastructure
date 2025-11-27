import { useState, useEffect, useCallback } from 'react';
import { Device, Cable, NetworkState, DeviceType } from './types/network';
import { saveNetworkState, loadNetworkState } from './utils/storage';
import { simulatePacket, createPacketLog } from './utils/packetSimulation';
import DeviceNode from './components/DeviceNode';
import DeviceConfig from './components/DeviceConfig';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import Dashboard from './components/Dashboard';
import ConnectionMenu from './components/ConnectionMenu';

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

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [connectionMenu, setConnectionMenu] = useState<{
    device: Device;
    position: { x: number; y: number };
  } | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [draggingDevice, setDraggingDevice] = useState<string | null>(null);
  const [animatingPath, setAnimatingPath] = useState<string[]>([]);
  const [animationSuccess, setAnimationSuccess] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedDeviceId(id);
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

  const updateDevice = useCallback((device: Device) => {
    setState(prev => ({
      ...prev,
      devices: prev.devices.map(d => (d.id === device.id ? device : d))
    }));
  }, []);

  const deleteDevice = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      devices: prev.devices.filter(d => d.id !== id),
      cables: prev.cables.filter(c => c.from !== id && c.to !== id)
    }));
    setSelectedDevice(null);
  }, []);

  const addCable = useCallback((from: string, to: string, type: 'lan' | 'wan') => {
    const exists = state.cables.some(
      c => (c.from === from && c.to === to) || (c.from === to && c.to === from)
    );
    if (!exists) {
      const newCable: Cable = {
        id: `cable-${Date.now()}`,
        from,
        to,
        type,
        connected: true
      };
      setState(prev => ({ ...prev, cables: [...prev.cables, newCable] }));
    }
    setConnectionMenu(null);
  }, [state.cables]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
      <Toolbar
        onAddDevice={addDevice}
        onClearAll={clearAll}
        onExport={exportData}
        onImport={importData}
      />

      <div
        className="w-full h-screen relative"
        onClick={() => {
          setSelectedDeviceId(null);
          setSelectedDevice(null);
          setConnectionMenu(null);
        }}
      >
        <Canvas
          devices={state.devices}
          cables={state.cables}
          animatingPath={animatingPath}
          animationSuccess={animationSuccess}
        />

        {state.devices.map(device => (
          <DeviceNode
            key={device.id}
            device={device}
            isSelected={device.id === selectedDeviceId}
            onDragStart={(e, d) => {
              setDraggingDevice(d.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDrag={(e) => {
              if (draggingDevice && e.clientX > 0 && e.clientY > 0) {
                handleDeviceDrag(draggingDevice, e.clientX, e.clientY);
              }
            }}
            onDragEnd={() => {
              setDraggingDevice(null);
            }}
            onClick={() => {
              setSelectedDevice(device);
              handleSelect(device.id)
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConnectionMenu({
                device,
                position: { x: e.clientX, y: e.clientY }
              });
            }}
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
        <ConnectionMenu
          position={connectionMenu.position}
          sourceDevice={connectionMenu.device}
          devices={state.devices}
          onConnect={(targetId, cableType) => addCable(connectionMenu.device.id, targetId, cableType)}
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
