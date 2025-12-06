import { useState, useEffect } from 'react';
import {Direction, ConnectionMenuProps } from '../types/network';
import { Cable as CableIcon, Zap, Trash2, Radio } from 'lucide-react';

export default function ConnectionMenu({
  position,
  sourceDevice,
  cables,
  devices,
  onConnect,
  onSendPacket,
  onDisconnect,
  connectedDevices,
}: ConnectionMenuProps) {
  
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedCable, setSelectedCable] = useState<'lan' | 'wan' | 'wireless' | null>(null);

  const otherDevices = devices.filter(d => d.id !== sourceDevice.id);

  const handlePortSelect = (port: Direction) => {
    if (selectedDevice && selectedCable) {
      onConnect(selectedDevice, selectedCable, port);
      setSelectedDevice(null);
      setSelectedCable(null);
    }
  };
  const ports: Direction[] = ["left", "top", "bottom", "right"];

  useEffect(() => {
    setSelectedDevice(null);
    setSelectedCable(null);
  }, [position.x, position.y]);

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl p-3 z-50 max-h-96 overflow-y-auto"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-sm font-semibold text-gray-700 mb-2">
        {sourceDevice.type === 'internet' ? 'INTERNET' : sourceDevice.name}
      </div>

      <div className="space-y-1">
        {otherDevices.map(device => {
          const isConnected = connectedDevices.includes(device.id);

          return (
            <div key={device.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 flex-1">
                {device.type === 'internet' ? 'INTERNET' : device.name}
              </span>

              {!isConnected ? (
                <>
                  {/* Choose cable → then port */}
                  <button
                    onClick={() => {
                      setSelectedDevice(device.id);
                      setSelectedCable('wan');
                    }}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 flex items-center gap-1"
                  >
                    <CableIcon className="w-3 h-3" /> WAN
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDevice(device.id);
                      setSelectedCable('lan');
                    }}
                    className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs hover:bg-gray-100 flex items-center gap-1"
                  >
                    <CableIcon className="w-3 h-3" /> LAN
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDevice(device.id);
                      setSelectedCable('wireless');
                    }}
                    className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs hover:bg-yellow-100 flex items-center gap-1"
                  >
                    <Radio className="w-3 h-3" /> Wireless
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onSendPacket(device.id)}
                    className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs hover:bg-yellow-100 flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Send
                  </button>

                  <button
                    onClick={() => onDisconnect(device.id)}
                    className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs hover:bg-red-100 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {(() => {
                    const cable = cables.find(
                      c =>
                        (c.from === sourceDevice.id && c.to === device.id) ||
                        (c.to === sourceDevice.id && c.from === device.id)
                    );

                    if (!cable) return null;

                    const label =
                      cable.type === "wan"
                        ? "WAN"
                        : cable.type === "lan"
                        ? "LAN"
                        : "Wireless";

                    const colorClass =
                      cable.type === "wan"
                        ? "text-blue-600 border-blue-300 bg-blue-50"
                        : cable.type === "lan"
                        ? "text-gray-700 border-gray-300 bg-gray-100"
                        : "text-yellow-700 border-yellow-300 bg-yellow-100";

                    return (
                      <span
                        className={`px-2 py-0.5 border rounded text-[10px] font-semibold ${colorClass}`}
                      >
                        {label}
                      </span>
                    );
                  })()}
                </>
              )}
            </div>
          );
        })}

        {/* PORT SELECTOR POPUP */}
        {selectedDevice && selectedCable && (
          <div className="mb-3 p-2 bg-gray-50 border rounded-lg">
            <div className="text-xs font-semibold text-gray-600 mb-1">
              Select destination port of { otherDevices.find(d => d.id === selectedDevice)?.type === "internet" ? "INTERNET" : otherDevices.find(d => d.id === selectedDevice)?.name}
            </div>

            <div className="grid grid-cols-4 gap-1">
              {ports.map((port) => (
                <button
                  key={port}
                  onClick={() => handlePortSelect(port)}
                  className="px-2 py-1 bg-blue-50 rounded text-xs text-blue-700 hover:bg-blue-100"
                >
                  {port.toUpperCase().charAt(0)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}