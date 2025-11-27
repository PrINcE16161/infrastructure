import { useRef, useEffect } from 'react';
import { Device, Cable } from '../types/network';

interface CanvasProps {
  devices: Device[];
  cables: Cable[];
  animatingPath: string[];
  animationSuccess: boolean;
}

export default function Canvas({ devices, cables, animatingPath, animationSuccess }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cables.forEach(cable => {
      const fromDevice = devices.find(d => d.id === cable.from);
      const toDevice = devices.find(d => d.id === cable.to);

      if (!fromDevice || !toDevice) return;

      ctx.beginPath();
      ctx.moveTo(fromDevice.position.x, fromDevice.position.y);
      ctx.lineTo(toDevice.position.x, toDevice.position.y);

      if (cable.connected) {
        ctx.strokeStyle = cable.type === 'wan' ? '#3b82f6' : '#6b7280';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
      }

      ctx.stroke();
      ctx.setLineDash([]);
    });

    if (animatingPath.length > 1) {
      for (let i = 0; i < animatingPath.length - 1; i++) {
        const fromDevice = devices.find(d => d.id === animatingPath[i]);
        const toDevice = devices.find(d => d.id === animatingPath[i + 1]);

        if (!fromDevice || !toDevice) continue;

        ctx.beginPath();
        ctx.moveTo(fromDevice.position.x, fromDevice.position.y);
        ctx.lineTo(toDevice.position.x, toDevice.position.y);
        ctx.strokeStyle = animationSuccess ? '#10b981' : '#ef4444';
        ctx.lineWidth = 4;
        ctx.stroke();

        const midX = (fromDevice.position.x + toDevice.position.x) / 2;
        const midY = (fromDevice.position.y + toDevice.position.y) / 2;
        ctx.beginPath();
        ctx.arc(midX, midY, 6, 0, Math.PI * 2);
        ctx.fillStyle = animationSuccess ? '#10b981' : '#ef4444';
        ctx.fill();
      }
    }
  }, [devices, cables, animatingPath, animationSuccess]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
