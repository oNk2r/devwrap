import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { DevWrapStats, DevWrapRepo, DevWrapProfile } from '../types/github';

interface RadarChartProps {
  stats: DevWrapStats;
  repositories: DevWrapRepo[];
  profile: DevWrapProfile;
}

const TRAIT_CONFIG = [
  { key: 'builder', label: 'Builder', color: '#FFDE59', bg: 'bg-[#FFDE59]', icon: '🛠️' },
  { key: 'explorer', label: 'Explorer', color: '#38BDF8', bg: 'bg-[#38BDF8]', icon: '🧭' },
  { key: 'creator', label: 'Creator', color: '#FB923C', bg: 'bg-[#FB923C]', icon: '✨' },
  { key: 'openSource', label: 'Open Source', color: '#00F5A0', bg: 'bg-[#00F5A0]', icon: '🌐' },
  { key: 'aiEngineer', label: 'AI Pioneer', color: '#C084FC', bg: 'bg-[#C084FC]', icon: '🤖' },
  { key: 'problemSolver', label: 'Solver', color: '#FF6B6B', bg: 'bg-[#FF6B6B]', icon: '⚡' },
];

export default function RadarChart({ stats, repositories, profile }: RadarChartProps) {
  const [activeTrait, setActiveTrait] = useState<number | null>(null);

  // Calculate traits based on profile data
  const traits = useMemo(() => {
    // 1. Builder: quantity of repos and commit streak consistency
    const builder = Math.min(99, Math.max(30, (repositories.length * 4) + (stats.streak * 1.5)));

    // 2. Explorer: variety of tech stacks/languages
    const explorer = Math.min(99, Math.max(35, (stats.topLanguages.length * 12) + (repositories.length * 1)));

    // 3. Creator: total stars and forks signifying high community value creations
    const creator = Math.min(99, Math.max(25, (stats.totalStars * 3) + (stats.totalForks * 2) + 30));

    // 4. Open Source: followers, forks and whether profile is popular
    const openSource = Math.min(99, Math.max(25, (profile.followers * 2.5) + (stats.totalForks * 4) + 25));

    // 5. AI Engineer: AI score and modern LLM usage
    const aiEngineer = Math.min(99, Math.max(35, stats.aiScore));

    // 6. Problem Solver: streak and logic languages / forks
    const problemSolver = Math.min(99, Math.max(30, (stats.streak * 2.2) + (stats.totalForks * 3) + 28));

    return [
      { name: 'Builder', value: Math.round(builder), desc: 'Frequent repository builds and project creation.' },
      { name: 'Explorer', value: Math.round(explorer), desc: 'Adapts diverse languages and modern stacks.' },
      { name: 'Creator', value: Math.round(creator), desc: 'Generates community engagement, stars & forks.' },
      { name: 'Open Source', value: Math.round(openSource), desc: 'Shares code publicly with global developers.' },
      { name: 'AI Pioneer', value: Math.round(aiEngineer), desc: 'Integrates neural APIs and generative workflows.' },
      { name: 'Solver', value: Math.round(problemSolver), desc: 'Maintains long consistency and debugging stamina.' },
    ];
  }, [stats, repositories, profile]);

  const width = 380;
  const height = 340;
  const cx = width / 2;
  const cy = height / 2;
  const r = 115; // outer circle radius

  // Calculate coordinates for a trait at a specific level (0-100)
  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2; // offset so top trait is at 12 o'clock
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

  // Coordinates for the labels (placed outer)
  const labelPositions = traits.map((t, idx) => {
    const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
    const distance = r + 26;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);

    let textAnchor: 'middle' | 'start' | 'end' = 'middle';
    if (Math.cos(angle) > 0.15) textAnchor = 'start';
    if (Math.cos(angle) < -0.15) textAnchor = 'end';

    return { x, y, textAnchor, label: t.name, val: t.value, idx };
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Radar SVG Diagram */}
      <div className="relative w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[380px] overflow-visible">
          <defs>
            <linearGradient id="neoRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFDE59" stopOpacity="0.45" />
            </linearGradient>
            <filter id="neoShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="3" dy="3" stdDeviation="0" floodColor="#000000" />
            </filter>
          </defs>

          {/* Concentric grid rings */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill={idx % 2 === 0 ? '#F9F8F5' : '#FFFFFF'}
              stroke="#000000"
              strokeWidth={idx === 3 ? 2 : 1}
              strokeDasharray={idx === 3 ? '0' : '3 3'}
              opacity={0.8}
            />
          ))}

          {/* Level Markers */}
          {[25, 50, 75, 100].map((lvl) => (
            <text
              key={lvl}
              x={cx + 4}
              y={cy - (lvl / 100) * r + 10}
              className="font-mono text-[9px] font-bold fill-neutral-400 select-none pointer-events-none"
            >
              {lvl}%
            </text>
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
                stroke="#000000"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.4}
              />
            );
          })}

          {/* Radar Value Shape */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            points={polygonPointsStr}
            fill="url(#neoRadarGrad)"
            stroke="#000000"
            strokeWidth={2.5}
            className="origin-center"
          />

          {/* Highlight vertices with Neo-brutalist pins */}
          {dataPoints.map((point, i) => {
            const isHovered = activeTrait === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setActiveTrait(i)}
                onMouseLeave={() => setActiveTrait(null)}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 8 : 5.5}
                  fill={TRAIT_CONFIG[i].color}
                  stroke="#000000"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />
                {isHovered && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={12}
                    fill="none"
                    stroke="#000000"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}

          {/* Labels text */}
          {labelPositions.map((pos, i) => {
            const isHovered = activeTrait === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setActiveTrait(i)}
                onMouseLeave={() => setActiveTrait(null)}
              >
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor={pos.textAnchor}
                  className="font-sans text-[11px] font-extrabold uppercase select-none transition-colors"
                  fill={isHovered ? '#000000' : '#222222'}
                  dy={i === 0 ? -6 : i === 3 ? 14 : 3}
                >
                  {pos.label}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 13}
                  textAnchor={pos.textAnchor}
                  className="font-mono text-[10px] font-bold select-none"
                  fill="#555555"
                  dy={i === 0 ? -6 : i === 3 ? 14 : 3}
                >
                  {pos.val}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
