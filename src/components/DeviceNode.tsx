import { Device } from '../types/network';
import {
  Cloud,
  Router,
  Server,
  MonitorSmartphone,
  Network,
  Cable
} from 'lucide-react';

interface ConnectionPoint {
  position: 'top' | 'bottom' | 'left' | 'right';
  x: number;
  y: number;
}

interface DeviceNodeProps {
  device: Device;
  isSelected: boolean;
  onDragStart: (e: React.DragEvent, device: Device) => void;
  onDrag: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onConnectionPointClick?: (deviceId: string, port: 'top' | 'bottom' | 'left' | 'right') => void;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  connectingFrom?: string | null;
}

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'internet': return Cloud;
    case 'isp': return Cable;
    case 'router': return Router;
    case 'switch': return Network;
    case 'server': return Server;
    case 'pc': return MonitorSmartphone;
    default: return Network;
  }
};

const getDeviceColor = (device: Device) => {
  if (device.status === 'disconnected') return 'bg-red-500';

  switch (device.type) {
    case 'internet': return 'bg-sky-500'
    case 'isp': return 'bg-blue-500';
    case 'router': return 'bg-green-500';
    case 'switch': return 'bg-yellow-500';
    case 'server': return 'bg-orange-500';
    case 'pc': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

export default function DeviceNode({
  device,
  isSelected,
  onDragStart,
  onDrag,
  onDragEnd,
  onConnectionPointClick,
  onClick,
  onContextMenu,
  connectingFrom
}: DeviceNodeProps) {
  const Icon = getDeviceIcon(device.type);
  const sizeClass = device.type === 'internet' ? 'w-32 h-32' : 'w-20 h-20';
  const color = getDeviceColor(device);
  const isConnected = device.status === 'connected';

  const SIZE = 80;

  const getConnectionPoints = (): ConnectionPoint[] => {
    const x = device.position.x;
    const y = device.position.y;
    const offset = SIZE / 2;

    return [
      { position: 'top', x, y: y - offset },
      { position: 'bottom', x, y: y + offset },
      { position: 'left', x: x - offset, y },
      { position: 'right', x: x + offset, y },
    ];
  };

  const connectionPoints = getConnectionPoints();
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, device)}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e);
      }}
      className={`absolute cursor-move transition-all ${
        isSelected ? 'ring-4 ring-blue-400' : ''
      }`}
      style={{
        left: device.position.x,
        top: device.position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className={`relative flex flex-col items-center justify-center ${sizeClass} rounded-lg shadow-lg transition-all hover:scale-110 border-2 ${
          isConnected ? 'border-transparent' : 'border-red-500'
        } ${color}`}
      >
        {/* TOP-RIGHT STATUS DOT */}
        {device.status === 'connected' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        )}
        {device.status === 'disconnected' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}

        {/* DEVICE ICON */}
        <Icon className="w-8 h-8 text-white" />

        {/* LABEL */}
        <div className="absolute -bottom-6 text-xs font-medium px-2 py-1 rounded whitespace-nowrap max-w-[90px] overflow-hidden text-ellipsis">
          {device.type === 'internet' ? 'INTERNET' : device.name}
        </div>

        {/* SHOW POINTS ONLY WHEN HOVERING DEVICE */}
        <div className="absolute inset-0 group">
          {connectionPoints.map((point) => {
            const isConnectingFrom = connectingFrom === `${device.id}-${point.position}`;

            return (
              <div
                key={`${device.id}-${point.position}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onConnectionPointClick?.(device.id, point.position);
                }}
                className={`
                  absolute w-4 h-4 rounded-full border-2 shadow-md cursor-pointer
                  opacity-0 group-hover:opacity-100 transition-all
                  ${
                    isConnectingFrom
                      ? 'bg-blue-500 border-blue-300 animate-pulse'
                      : 'bg-white border-gray-400 hover:bg-blue-400 hover:border-blue-500'
                  }
                `}
                style={{
                  left:
                    point.position === 'left'
                      ? '-10px'
                      : point.position === 'right'
                      ? 'calc(100% - 7px)'
                      : 'calc(50% - 8px)',
                  top:
                    point.position === 'top'
                      ? '-10px'
                      : point.position === 'bottom'
                      ? 'calc(100% - 7px)'
                      : 'calc(50% - 8px)',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
