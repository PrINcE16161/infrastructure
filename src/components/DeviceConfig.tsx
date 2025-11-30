import { Device } from '../types/network';
import { X } from 'lucide-react';

interface DeviceConfigProps {
  device: Device;
  onUpdate: (device: Device) => void;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeviceConfig({ device, onUpdate, onClose, onDelete }: DeviceConfigProps) {
  const updateConfig = (updates: Partial<Device['config']>) => {
    onUpdate({ ...device, config: { ...device.config, ...updates } });
  };

  const updateName = (name: string) => {
    onUpdate({ ...device, name });
  };

  return (
    <div className="absolute right-20 top-4 w-80 bg-white rounded-lg border border-gray-200 z-10">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Configure {device.type === 'internet' ? 'INTERNET' : device.type.toUpperCase()}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            {device.type !== 'internet' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                <input
                  type="text"
                  value={device.name}
                  onChange={(e) => updateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                <input
                  type="text"
                  value="INTERNET"
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                />
              </div>
            )}
          </div>

          {device.type === 'router' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal IP</label>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={device.config.internalIp || ''}
                  onChange={(e) => updateConfig({ internalIp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WAN IP</label>
                <input
                  type="text"
                  placeholder="10.0.0.1"
                  value={device.config.wanIp || ''}
                  onChange={(e) => updateConfig({ wanIp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={device.config.dhcpEnabled || false}
                  onChange={(e) => updateConfig({ dhcpEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Enable DHCP</label>
              </div>
              {device.config.dhcpEnabled && (
                <div className="pl-6 space-y-2">
                  <input
                    type="text"
                    placeholder="Start: 192.168.1.100"
                    value={device.config.dhcpRange?.start || ''}
                    onChange={(e) =>
                      updateConfig({
                        dhcpRange: { ...device.config.dhcpRange!, start: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="End: 192.168.1.200"
                    value={device.config.dhcpRange?.end || ''}
                    onChange={(e) =>
                      updateConfig({
                        dhcpRange: { ...device.config.dhcpRange!, end: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={device.config.natEnabled || false}
                  onChange={(e) => updateConfig({ natEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Enable NAT</label>
              </div>
            </>
          )}

          {device.type === 'server' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Static IP</label>
                <input
                  type="text"
                  placeholder="192.168.1.10"
                  value={device.config.internalIp || ''}
                  onChange={(e) => updateConfig({ internalIp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Open Ports (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="22, 80, 443"
                  value={(device.config.ports || []).join(', ')}
                  onChange={(e) =>
                    updateConfig({
                      ports: e.target.value
                        .split(',')
                        .map(p => parseInt(p.trim()))
                        .filter(p => !isNaN(p))
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {device.type === 'pc' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal IP</label>
                <input
                  type="text"
                  placeholder="192.168.1.100"
                  value={device.config.internalIp || ''}
                  onChange={(e) => updateConfig({ internalIp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gateway</label>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={device.config.gateway || ''}
                  onChange={(e) => updateConfig({ gateway: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {device.type === 'switch' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Port List (comma-separated)
              </label>
              <input
                type="text"
                placeholder="1, 2, 3, 4, 5, 6, 7, 8"
                value={(device.config.portList || []).join(', ')}
                onChange={(e) =>
                  updateConfig({
                    portList: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {device.type === 'isp' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WAN IP</label>
              <input
                type="text"
                placeholder="203.0.113.1"
                value={device.config.wanIp || ''}
                onChange={(e) => updateConfig({ wanIp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
        {/* CONNECT / DISCONNECT BUTTON */}
        {device.status === 'connected' ? (
          <button
            onClick={() => {
              onUpdate({ ...device, status: 'disconnected' });
              onClose();
            }}
            className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => {
              onUpdate({ ...device, status: 'connected' });
              onClose();
            }}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Connect
          </button>
        )}

        {/* DELETE BUTTON (fixed missing space) */}
        <button
          onClick={onDelete}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
        >
          Delete
        </button>

        {/* SAVE BUTTON */}
        <button
          onClick={onClose}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save
        </button>

      </div>
      </div>
    </div>
  );
}
