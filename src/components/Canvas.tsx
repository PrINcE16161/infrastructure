import { useRef, useEffect } from 'react';
import { Device, Cable } from '../types/network';

interface CanvasProps {
  devices: Device[];
  cables: Cable[];
  animatingPath: string[];
  animationProgress: number;
  animationSuccess: boolean;
}

// 🔵 Helper: calculate the port-to-cable coordinates
function getPortPosition(device: Device, port: 'top' | 'bottom' | 'left' | 'right') {
  const size = 80;
  const half = size / 2;

  switch (port) {
    case 'top': return { x: device.position.x, y: device.position.y - half };
    case 'bottom': return { x: device.position.x, y: device.position.y + half };
    case 'left': return { x: device.position.x - half, y: device.position.y };
    case 'right': return { x: device.position.x + half, y: device.position.y };
    default: return { x: device.position.x, y: device.position.y };
  }
}

function getCorrectPort(cable: Cable, fromId: string, toId: string) {
  if (cable.from === fromId) {
    return { fromPort: cable.fromPort, toPort: cable.toPort };
  } else {
    // 🔥 Reverse direction → swap ports
    return { fromPort: cable.toPort, toPort: cable.fromPort };
  }
}

export default function Canvas({ devices, cables, animatingPath, animationProgress, animationSuccess }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, width, height);

    // Dotted grid
    const spacing = 20;
    const dotRadius = 1;
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw cables
    cables.forEach(cable => {
      const fromDevice = devices.find(d => d.id === cable.from);
      const toDevice = devices.find(d => d.id === cable.to);

      if (!fromDevice || !toDevice) return;
      if (cable.type === "wireless") return;

      const fromPos = getPortPosition(fromDevice, cable.fromPort || 'right');
      const toPos = getPortPosition(toDevice, cable.toPort || 'left');

      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const curveRadius = 15;

      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);

      const isAlignedHorizontal = Math.abs(dy) < 5;
      const isAlignedVertical = Math.abs(dx) < 5;
      const isHorizontalFirst = cable.fromPort === "right" || cable.fromPort === "left";

      if (isAlignedHorizontal || isAlignedVertical) {
        ctx.lineTo(toPos.x, toPos.y);
      } else {
        if (isHorizontalFirst) {
          const cornerX = toPos.x;
          const cornerY = fromPos.y;
          const horizontalEnd = cornerX - (dx > 0 ? curveRadius : -curveRadius);

          ctx.lineTo(horizontalEnd, fromPos.y);
          ctx.arcTo(cornerX, cornerY, cornerX, toPos.y, curveRadius);
          ctx.lineTo(toPos.x, toPos.y);
        } else {
          const cornerX = fromPos.x;
          const cornerY = toPos.y;
          const verticalEnd = cornerY - (dy > 0 ? curveRadius : -curveRadius);

          ctx.lineTo(fromPos.x, verticalEnd);
          ctx.arcTo(cornerX, cornerY, toPos.x, cornerY, curveRadius);
          ctx.lineTo(toPos.x, toPos.y);
        }
      }

      ctx.strokeStyle = cable.connected
        ? cable.type === "wan" ? "#3b82f6" : "#808080ff"
        : "#ef4444";

      ctx.lineWidth = 2;
      if (!cable.connected) ctx.setLineDash([5, 5]);

      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 🔥 Animated dotted path
    if (animatingPath.length > 1) {
      for (let i = 0; i < animatingPath.length - 1; i++) {

        const fromDevice = devices.find(d => d.id === animatingPath[i]);
        const toDevice = devices.find(d => d.id === animatingPath[i + 1]);
        const cable = cables.find(
          c =>
            (c.from === fromDevice?.id && c.to === toDevice?.id) ||
            (c.to === fromDevice?.id && c.from === toDevice?.id)
        );

        if (!fromDevice || !toDevice || !cable) continue;

        // 🔥 Get correct directional ports
        const { fromPort, toPort } = getCorrectPort(cable, fromDevice.id, toDevice.id);

        const fromPos = getPortPosition(fromDevice, fromPort || "right");
        const toPos = getPortPosition(toDevice, toPort || "left");

        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const curveRadius = 15;

        const isStraight = Math.abs(dx) < 5 || Math.abs(dy) < 5;

        // 🔥 IMPORTANT FIX – use reversed ports!
        const isHorizontalFirst = fromPort === "right" || fromPort === "left";

        const path = new Path2D();
        path.moveTo(fromPos.x, fromPos.y);

        if (isStraight) {
          path.lineTo(toPos.x, toPos.y);
        } else {
          if (isHorizontalFirst) {
            const cornerX = toPos.x;
            const cornerY = fromPos.y;
            const horizontalEnd = cornerX - (dx > 0 ? curveRadius : -curveRadius);

            path.lineTo(horizontalEnd, fromPos.y);
            path.arcTo(cornerX, cornerY, cornerX, toPos.y, curveRadius);
            path.lineTo(toPos.x, toPos.y);

          } else {
            const cornerX = fromPos.x;
            const cornerY = toPos.y;
            const verticalEnd = cornerY - (dy > 0 ? curveRadius : -curveRadius);

            path.lineTo(fromPos.x, verticalEnd);
            path.arcTo(cornerX, cornerY, toPos.x, cornerY, curveRadius);
            path.lineTo(toPos.x, toPos.y);
          }
        }

        // dotted animated stroke
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = animationSuccess ? "#10b981" : "#ef4444";
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = 300 * (1 - animationProgress);
        ctx.stroke(path);
        ctx.restore();
      }
    }
  }, [devices, cables, animatingPath, animationProgress, animationSuccess]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}