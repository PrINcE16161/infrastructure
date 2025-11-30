import { Cable as CableType } from '../types/network';

interface CableProps {
  cable: CableType;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
}

const CableNode = ({ cable, fromPos, toPos }: CableProps) => {
  const getColors = () => {
    if (cable.type === 'wan') {
      return { mainColor: '#3B82F6', glowColor: 'rgba(59, 130, 246, 0.5)' };
    }
    if (cable.type === 'lan') {
      return { mainColor: '#10B981', glowColor: 'rgba(16, 185, 129, 0.5)' };
    }
    if (cable.type === "wireless") {
       return { mainColor: "#FBBF24", glowColor: "rgba(251, 191, 36, 0.5)" };
    }
    return { mainColor: '#f50b0bff', glowColor: 'rgba(245, 11, 11, 0.5)' };
  };

  const { mainColor, glowColor } = getColors();
  const strokeWidth = cable.connected ? 3 : 2;

  const pathId = `cable-path-${cable.id}`;

  return (
    <g>
      {cable.connected ? (
        <>
          {/* Glow */}
          <line
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke={glowColor}
            strokeWidth={strokeWidth + 6}
            opacity={0.3}
          />

          {/* Main cable */}
          <line
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke={mainColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Flowing dash effect */}
          <line
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke={mainColor}
            strokeWidth={strokeWidth}
            strokeDasharray="20,10"
            opacity={0.7}
            style={{ animation: 'dash 2s linear infinite' } as any}
          />

          {/* MOVING DATA DOT */}
          <defs>
            <linearGradient id={`grad-${cable.id}`} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={mainColor} />
              <stop offset="100%" stopColor={glowColor} />
            </linearGradient>

            <path
              id={pathId}
              d={`M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`}
            />

            <style>
              {`
                @keyframes dash {
                  to { stroke-dashoffset: -30; }
                }

                @keyframes data-move {
                  0%   { offset-distance: 0%; }
                  100% { offset-distance: 100%; }
                }
              `}
            </style>
          </defs>

          <circle
            r="5"
            fill={`url(#grad-${cable.id})`}
            style={{
              offsetPath: `path("M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}")`,
              animation: 'data-move 1.3s linear infinite'
            }}
          />
        </>
      ) : (
        <>
          {/* Disconnected red dashed */}
          <line
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke="rgba(239, 68, 68, 0.6)"
            strokeWidth={strokeWidth + 4}
            opacity={0.3}
            strokeDasharray="6,6"
          />

          <line
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke="rgb(239, 68, 68)"
            strokeWidth={strokeWidth}
            strokeDasharray="6,6"
          />
        </>
      )}
    </g>
  );
};

export default CableNode;