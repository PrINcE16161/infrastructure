import { PacketLog, NetworkState } from '../types/network';
import { Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  stats: NetworkState['stats'];
  logs: PacketLog[];
}

export default function Dashboard({ stats, logs }: DashboardProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-h-64 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Network Dashboard</h3>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-800">Delivered</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{stats.packetsDelivered}</div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-800">Dropped</span>
          </div>
          <div className="text-2xl font-bold text-red-700">{stats.packetsDropped}</div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">Online</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.deviceOnline}</div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-800">Offline</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">{stats.deviceOffline}</div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-800">Port Attempts</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">{stats.portAttempts}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h4>
        <div className="space-y-1">
          {logs.slice(-10).reverse().map(log => (
            <div
              key={log.id}
              className={`text-xs p-2 rounded ${
                log.status === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <span className="font-medium">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              {' - '}
              <span>
                {log.from} → {log.to}
              </span>
              {' - '}
              <span className="font-semibold">
                {log.status === 'success' ? 'SUCCESS' : `FAILED: ${log.reason}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
