import { useEffect, useRef } from 'react';

interface Cable {
  id: number;
  x: number;
  y: number;
  direction: number;
  color: string;
  length: number;
  speed: number;
  segments: Array<{ x: number; y: number }>;
  colorChangeCounter: number;
  directionChangeCounter: number;
}

export default function AnimatedCableBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cablesRef = useRef<Cable[]>([]);
  const framesRef = useRef(0);

  // Softer, more professional color palette
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#000000'];
  const directions = [0, 90, 180, 270];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fewer cables for cleaner look
    cablesRef.current = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      direction: directions[Math.floor(Math.random() * directions.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      length: 200 + Math.random() * 60,
      speed: 0.6 + Math.random() * 0.2,
      segments: [],
      colorChangeCounter: 0,
      directionChangeCounter: 0
    }));

    const animate = () => {
      framesRef.current++;

      // Lighter fade for cleaner trails
      ctx.fillStyle = 'rgba(248, 250, 252, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      cablesRef.current.forEach((cable) => {
        const radians = (cable.direction * Math.PI) / 180;
        const vx = Math.cos(radians) * cable.speed;
        const vy = Math.sin(radians) * cable.speed;

        cable.x += vx;
        cable.y += vy;

        cable.segments.push({ x: cable.x, y: cable.y });
        if (cable.segments.length > cable.length) {
          cable.segments.shift();
        }

        // Wrap around screen edges
        if (cable.x > canvas.width + 20) cable.x = -20;
        if (cable.x < -20) cable.x = canvas.width + 20;
        if (cable.y > canvas.height + 20) cable.y = -20;
        if (cable.y < -20) cable.y = canvas.height + 20;

        // Smoother direction changes
        cable.directionChangeCounter++;
        if (cable.directionChangeCounter > 800) {
          cable.direction = directions[Math.floor(Math.random() * directions.length)];
          cable.directionChangeCounter = 0;
        }

        // Subtle color changes
        cable.colorChangeCounter++;
        if (cable.colorChangeCounter > 1200) {
          cable.color = colors[Math.floor(Math.random() * colors.length)];
          cable.colorChangeCounter = 0;
        }

        // Draw cable with subtle styling
        if (cable.segments.length > 1) {
          const gradient = ctx.createLinearGradient(
            cable.segments[0].x,
            cable.segments[0].y,
            cable.x,
            cable.y
          );

          gradient.addColorStop(0, `${cable.color}00`);
          gradient.addColorStop(0.3, `${cable.color}40`);
          gradient.addColorStop(1, `${cable.color}80`);

          // Main cable line (thinner)
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(cable.segments[0].x, cable.segments[0].y);
          for (let i = 1; i < cable.segments.length; i++) {
            ctx.lineTo(cable.segments[i].x, cable.segments[i].y);
          }
          ctx.stroke();

          // Subtle outer glow
          ctx.strokeStyle = `${cable.color}20`;
          ctx.lineWidth = 6;
          ctx.stroke();

          // Small endpoint dot
          ctx.fillStyle = `${cable.color}B3`;
          ctx.beginPath();
          ctx.arc(cable.x, cable.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Subtle glow around endpoint
          ctx.fillStyle = `${cable.color}40`;
          ctx.beginPath();
          ctx.arc(cable.x, cable.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        filter: 'blur(0.8px)',
        opacity: 0.6,
        mixBlendMode: 'normal'
      }}
    />
  );
}