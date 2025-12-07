import { useState, useEffect } from 'react';
import { Device } from '../types/network';
import { X } from 'lucide-react';

interface DeviceConfigProps {
  device: Device;
  onUpdate: (deviceId: string, updates: Partial<Device>) => void;
  onClose: () => void;
  onDelete: () => void;
}

function deepEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function DeviceConfig({ device, onUpdate, onClose, onDelete }: DeviceConfigProps) {
  // Local editable copies — do NOT write to global state until Save
  const [localName, setLocalName] = useState(device.name);
  const [localConfig, setLocalConfig] = useState({ ...device.config });

  // Validation state
  const [dnsError, setDnsError] = useState('');

  // When the device prop changes (opening a different device), reinitialize local state
  useEffect(() => {
    setLocalName(device.name);
    setLocalConfig({ ...device.config });
    setDnsError('');
  }, [device]);

  // Helper to update the localConfig
  const setLocal = (updates: Partial<Device['config']>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  // Dirty check: either name changed or config changed
  const dirty = !(
    localName === device.name && deepEqual(localConfig, device.config)
  );

  // DNS validation watcher (ns1 / ns2 unique)
  useEffect(() => {
    if ((localConfig.ns1 || '') && (localConfig.ns2 || '') && localConfig.ns1 === localConfig.ns2) {
      setDnsError('NS1 and NS2 cannot be the same.');
    } else {
      setDnsError('');
    }
  }, [localConfig.ns1, localConfig.ns2]);

  // Save handler: only call onUpdate when there's actually a change
  const handleSave = () => {
    if (!dirty || dnsError) {
      // nothing to do or invalid
      return;
    }

    const updates: Partial<Device> = {};
    if (localName !== device.name) updates.name = localName;
    if (!deepEqual(localConfig, device.config)) updates.config = { ...localConfig };

    onUpdate(device.id, updates);
    onClose();
  };

  // Cancel/Close: discard local edits
  const handleClose = () => {
    onClose();
  };

  // Prevent clicks inside modal from bubbling up and closing via parent onClick
  return (
    <div
      className="absolute right-20 top-4 w-80 bg-white rounded-lg border border-gray-200 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Configure {device.type === 'internet' ? 'INTERNET' : device.type.toUpperCase()}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
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
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
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
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          {device.type === 'proxy' && (
            <>
              {/* IP Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proxy IP Address
                </label>
                <input
                  type="text"
                  placeholder="203.0.113.5"
                  value={localConfig.ipAddress || ""}
                  onChange={(e) => setLocal({ ipAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* TOGGLE: DNS Only / Proxied */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-medium text-gray-700">
                  Proxy Status:
                </span>

                {(() => {
                  const isProxied = localConfig.proxied ?? true; // DEFAULT TO ON

                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700">
                        {isProxied ? "Proxied" : "DNS Only"}
                      </span>

                      <button
                        onClick={() => setLocal({ proxied: !isProxied })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isProxied ? "bg-orange-500" : "bg-gray-300"}`}
                        type="button"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isProxied ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* DNS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNS Record
                </label>

                {/* NS1 */}
                <input
                  type="text"
                  placeholder="ns1.dns-parking.com"
                  value={localConfig.ns1 || ""}
                  onChange={(e) => setLocal({ ns1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />

                {/* NS2 */}
                <input
                  type="text"
                  placeholder="ns2.dns-parking.com"
                  value={localConfig.ns2 || ""}
                  onChange={(e) => setLocal({ ns2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Inline Error Message */}
                {dnsError && (
                  <p className="text-red-500 text-sm mt-1">{dnsError}</p>
                )}
              </div>
            </>
          )}

          {device.type === 'router' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal IP</label>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={localConfig.internalIp || ''}
                  onChange={(e) => setLocal({ internalIp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WAN IP</label>
                <input
                  type="text"
                  placeholder="10.0.0.1"
                  value={localConfig.wanIp || ''}
                  onChange={(e) => setLocal({ wanIp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localConfig.dhcpEnabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLocal({
                        dhcpEnabled: true,
                        dhcpRange: {
                          start: localConfig.dhcpRange?.start || "",
                          end: localConfig.dhcpRange?.end || ""
                        }
                      });
                    } else {
                      setLocal({ dhcpEnabled: false });
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Enable DHCP</label>
              </div>
              {localConfig.dhcpEnabled && (
                <div className="pl-6 space-y-2">
                  <input
                    type="text"
                    placeholder="Start: 192.168.1.100"
                    value={localConfig.dhcpRange?.start || ''}
                    onChange={(e) => {
                    if (e.target.checked) {
                      setLocal({
                        dhcpEnabled: true,
                        dhcpRange: {
                          start: localConfig.dhcpRange?.start || "",
                          end: localConfig.dhcpRange?.end || ""
                        }
                      });
                    } else {
                      setLocal({ dhcpEnabled: false });
                    }
                  }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="End: 192.168.1.200"
                    value={localConfig.dhcpRange?.end || ''}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocal({
                          dhcpEnabled: true,
                          dhcpRange: {
                            start: localConfig.dhcpRange?.start || "",
                            end: localConfig.dhcpRange?.end || ""
                          }
                        });
                      } else {
                        setLocal({ dhcpEnabled: false });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localConfig.natEnabled || false}
                  onChange={(e) => setLocal({ natEnabled: e.target.checked })}
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
                  value={localConfig.internalIp || ''}
                  onChange={(e) => setLocal({ internalIp: e.target.value })}
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
                  value={(localConfig.ports || []).join(', ')}
                  onChange={(e) =>
                    setLocal({
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
                  value={localConfig.internalIp || ''}
                  onChange={(e) => setLocal({ internalIp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gateway</label>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={localConfig.gateway || ''}
                  onChange={(e) => setLocal({ gateway: e.target.value })}
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
                value={(localConfig.portList || []).join(', ')}
                onChange={(e) =>
                  setLocal({
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
                value={localConfig.wanIp || ''}
                onChange={(e) => setLocal({ wanIp: e.target.value })}
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
                onUpdate(device.id, { status: 'disconnected' });
                onClose();
              }}
              className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => {
                onUpdate(device.id, { status: 'connected' });
                onClose();
              }}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Connect
            </button>
          )}

          {/* DELETE BUTTON */}
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={!dirty || !!dnsError}
            className={`flex-1 py-2 px-4 rounded-md transition-colors 
              ${(!dirty || dnsError) ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}
            `}
          >
            Save
          </button>

        </div>
      </div>
    </div>
  );
}