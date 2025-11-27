import { Device } from '../types/network';
import { Cable as CableIcon, Zap, Trash2 } from 'lucide-react';

interface ConnectionMenuProps {
  position: { x: number; y: number };
  sourceDevice: Device;
  devices: Device[];
  onConnect: (targetId: string, cableType: 'lan' | 'wan') => void;
  onSendPacket: (targetId: string) => void;
  onDisconnect: (targetId: string) => void;
  connectedDevices: string[];
}

export default function ConnectionMenu({
  position,
  sourceDevice,
  devices,
  onConnect,
  onSendPacket,
  onDisconnect,
  connectedDevices
}: ConnectionMenuProps) {
  const otherDevices = devices.filter(d => d.id !== sourceDevice.id);

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl p-3 z-50 max-h-96 overflow-y-auto"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-sm font-semibold text-gray-700 mb-2">
        {sourceDevice.name}
      </div>

      <div className="space-y-1">
        {otherDevices.map(device => {
          const isConnected = connectedDevices.includes(device.id);

          return (
            <div key={device.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 flex-1">{device.name}</span>

              {!isConnected ? (
                <>
                  <button
                    onClick={() => onConnect(device.id, 'lan')}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 flex items-center gap-1"
                    title="Connect LAN"
                  >
                    <CableIcon className="w-3 h-3" />
                    LAN
                  </button>
                  <button
                    onClick={() => onConnect(device.id, 'wan')}
                    className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 flex items-center gap-1"
                    title="Connect WAN"
                  >
                    <CableIcon className="w-3 h-3" />
                    WAN
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onSendPacket(device.id)}
                    className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs hover:bg-yellow-100 flex items-center gap-1"
                    title="Send Packet"
                  >
                    <Zap className="w-3 h-3" />
                    Send
                  </button>
                  <button
                    onClick={() => onDisconnect(device.id)}
                    className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs hover:bg-red-100 flex items-center gap-1"
                    title="Disconnect"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
