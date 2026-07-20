import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { DevWrapStats, DevWrapRepo, DevWrapProfile } from '../types/github';

interface RadarChartProps {
  stats: DevWrapStats;
  repositories: DevWrapRepo[];
  profile: DevWrapProfile;
}

export default function RadarChart({ stats, repositories, profile }: RadarChartProps) {
  // Calculate traits based on profile data
  const traits = useMemo(() => {
    // 1. Builder: quantity of repos and commit streak consistency
    const builder = Math.min(98, Math.max(35, (repositories.length * 4) + (stats.streak * 1.5)));

    // 2. Explorer: variety of tech stacks/languages
    const explorer = Math.min(95, Math.max(40, (stats.topLanguages.length * 12) + (repositories.length * 1)));

    // 3. Creator: total stars and forks signifying high community value creations
    const creator = Math.min(96, Math.max(30, (stats.totalStars * 3) + (stats.totalForks * 2) + 35));

    // 4. Open Source: followers, forks and whether profile is popular
    const openSource = Math.min(98, Math.max(30, (profile.followers * 2.5) + (stats.totalForks * 4) + 25));

    // 5. AI Engineer: AI score and Python/TypeScript usage
    const aiEngineer = Math.min(99, Math.max(45, stats.aiScore));

    // 6. Problem Solver: streak and logic languages / forks
    const problemSolver = Math.min(97, Math.max(35, (stats.streak * 2.2) + (stats.totalForks * 3) + 30));

    return [
      { name: 'Builder', value: builder, desc: 'Frequents compiles & builds' },
      { name: 'Explorer', value: explorer, desc: 'Adapts new frameworks' },
      { name: 'Creator', value: creator, desc: 'Designs viral packages' },
      { name: 'Open Source', value: openSource, desc: 'Shares code with community' },
      { name: 'AI Engineer', value: aiEngineer, desc: 'Integrates LLMs & AI APIs' },
      { name: 'Problem Solver', value: problemSolver, desc: 'Maintains long commit streaks' },
    ];
  }, [stats, repositories, profile]);

  const width = 480;
  const height = 420;
  const cx = width / 2;
  const cy = height / 2;
  const r = 140; // outer circle radius

  // Calculate coordinates for a trait at a specific level (0-100)
  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2; // offset so Builder is top
    const distance = (value / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  // Generate grid concentric circles
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map(level => {
    return Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      const x = cx + (level / 100) * r * Math.cos(angle);
      const y = cy + (level / 100) * r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  // Calculate coordinates for all traits
  const dataPoints = traits.map((t, idx) => getCoordinates(idx, t.value));
  const polygonPointsStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Coordinates for the labels (placed slightly outer)
  const labelPositions = traits.map((t, idx) => {
    const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
    const distance = r + 24;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    
    // Adjust text alignment based on position
    let textAnchor: 'middle' | 'start' | 'end' = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    if (Math.cos(angle) < -0.1) textAnchor = 'end';

    return { x, y, textAnchor, label: t.name, val: t.value };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 relative select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[500px] overflow-visible">
        <defs>
          <radialGradient id="radarAreaGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9FE870" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#9FE870" stopOpacity="0.25" />
          </radialGradient>
        </defs>

        {/* Concentric grid rings */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="#1c1c1f"
            strokeWidth={1}
            strokeDasharray={idx === 3 ? '0' : '3 3'}
          />
        ))}

        {/* Axis lines from center to outer points */}
        {Array.from({ length: 6 }).map((_, i) => {
          const outerCoord = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outerCoord.x}
              y2={outerCoord.y}
              stroke="#1c1c1f"
              strokeWidth={1}
            />
          );
        })}

        {/* Radar Value Shape with Framer Motion path animation */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          points={polygonPointsStr}
          fill="url(#radarAreaGradient)"
          stroke="#9FE870"
          strokeWidth={1.5}
          className="origin-center"
        />

        {/* Highlight vertices with glowing dots */}
        {dataPoints.map((point, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 200 }}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="#090909"
            stroke="#9FE870"
            strokeWidth={1.5}
            className="cursor-pointer"
            whileHover={{ scale: 1.5, strokeWidth: 3 }}
          />
        ))}

        {/* Labels text */}
        {labelPositions.map((pos, i) => (
          <g key={i}>
            <text
              x={pos.x}
              y={pos.y}
              textAnchor={pos.textAnchor}
              className="fill-neutral-400 font-sans text-[11px] font-medium tracking-wider uppercase select-none transition-colors duration-200 hover:fill-white"
              dy={i === 0 ? -6 : i === 3 ? 14 : 3}
            >
              {pos.label}
            </text>
            <text
              x={pos.x}
              y={pos.y + 14}
              textAnchor={pos.textAnchor}
              className="fill-[#9FE870] font-mono text-[10px] font-semibold"
              dy={i === 0 ? -6 : i === 3 ? 14 : 3}
            >
              {pos.val}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
