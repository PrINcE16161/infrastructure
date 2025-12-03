import { DeviceType } from '../types/network';
import { 
  Wifi, Server, MonitorSmartphone, Network, Cable, Plus, 
  Trash2, Save, Upload, Cloud, ShieldCheck, PanelLeft, X
} from 'lucide-react';

interface ToolbarProps {
  onAddDevice: (type: DeviceType) => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: () => void;

  onAddCable?: (type: 'lan' | 'wan') => void;
  onAddWireless?: () => void;

  showPanel: boolean;
  setShowPanel: (v: boolean) => void;
}

export default function Toolbar({ onAddDevice, onClearAll, onExport, onImport, showPanel, setShowPanel }: ToolbarProps) {
  
  const devices: { type: DeviceType; icon: typeof Wifi; label: string }[] = [
    { type: 'internet', icon: Cloud, label: 'Internet' },
    { type: 'proxy', icon: ShieldCheck, label: 'Proxy' },
    { type: 'isp', icon: Cable, label: 'ISP' },
    { type: 'router', icon: Wifi, label: 'Router' },
    { type: 'switch', icon: Network, label: 'Switch' },
    { type: 'server', icon: Server, label: 'Server' },
    { type: 'pc', icon: MonitorSmartphone, label: 'PC' }
  ];

  return (
    <>
      {/* 🔵 Show toggle button ONLY when panel is hidden */}
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="
            fixed top-10 -translate-y-1/2 left-0
            bg-blue-600 hover:bg-blue-700 text-white
            p-2 rounded-r-lg shadow-md
            z-[3000] transition-all
            flex items-center gap-2
          "
        >
          <PanelLeft className="w-6 h-6" />
          <span className="text-sm font-medium">Toolbar</span>
        </button>
      )}

      {/* 🟢 Panel */}
      {showPanel && (
        <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 transition-transform min-w-[220px]">

          {/* Title + Close button */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Add Devices
            </h3>

            {/* Close button */}
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Device buttons */}
          <div className="grid grid-cols-2 gap-2">
            {devices.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => onAddDevice(type)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
                <Plus className="w-3 h-3 ml-auto" />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>

              <button
                onClick={onImport}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Import</span>
              </button>

              <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}