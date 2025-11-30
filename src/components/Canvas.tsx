import { useRef, useEffect } from 'react';
import { Device, Cable } from '../types/network';

interface CanvasProps {
  devices: Device[];
  cables: Cable[];
  animatingPath: string[];
  animationSuccess: boolean;
}

// 🔵 Helper: calculate the port-to-cable coordinates
function getPortPosition(device: Device, port: 'top' | 'bottom' | 'left' | 'right') {
  const size = 80; // your device card width/height
  const half = size / 2;

  switch (port) {
    case 'top':
      return { x: device.position.x, y: device.position.y - half };
    case 'bottom':
      return { x: device.position.x, y: device.position.y + half };
    case 'left':
      return { x: device.position.x - half, y: device.position.y };
    case 'right':
      return { x: device.position.x + half, y: device.position.y };
    default:
      return { x: device.position.x, y: device.position.y };
  }
}

export default function Canvas({ devices, cables, animatingPath, animationSuccess }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 🔵 Canvas background color  
    ctx.fillStyle = "#f1f5f9"; // ← change your color here  
    ctx.fillRect(0, 0, width, height);

    // ---------------------------------------------------
    // ⭐ NEW: Draw 1x1 dotted background grid
    // ---------------------------------------------------
    const spacing = 20; // distance between dots
    const dotRadius = 1; // dot size
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; // faint gray dots

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // ---------------------------------------------------

    cables.forEach(cable => {
      const fromDevice = devices.find(d => d.id === cable.from);
      const toDevice = devices.find(d => d.id === cable.to);

      if (!fromDevice || !toDevice) return;
      if (cable.type === "wireless") return;

      const fromPos = getPortPosition(fromDevice, cable.fromPort || 'right');
      const toPos = getPortPosition(toDevice, cable.toPort || 'left');

      // ctx.beginPath();
      // ctx.moveTo(fromPos.x, fromPos.y);
      // ctx.lineTo(toPos.x, toPos.y);
      
      // 🎯 Auto-curved cable using quadratic Bézier curve
      ctx.beginPath();

      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;

      // Curve amount based on distance
      const curve = Math.max(0, Math.min(200, (Math.abs(dx) + Math.abs(dy)) / 2));

      // Control point
      let cx = fromPos.x;
      let cy = fromPos.y;

      // Smart routing based on port directions
      if (cable.fromPort === 'right') cx += curve;
      if (cable.fromPort === 'left') cx -= curve;
      if (cable.fromPort === 'top') cy -= curve;
      if (cable.fromPort === 'bottom') cy += curve;

      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.quadraticCurveTo(cx, cy, toPos.x, toPos.y);

      if (cable.connected) {
        switch (cable.type) {
          case 'wan':
            ctx.strokeStyle = '#3b82f6'; // blue
            break;
          case 'lan':
            ctx.strokeStyle = '#808080ff';
            break;
          default:
            ctx.strokeStyle = '#ef4444'; // red (fallback)
        }
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
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}