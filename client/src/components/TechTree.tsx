import { useMemo } from 'react';
import type { DevWrapStats, DevWrapRepo } from '../types/github';

interface TechTreeProps {
  stats: DevWrapStats;
  repositories: DevWrapRepo[];
}

interface SkillNode {
  id: string;
  name: string;
  level: number; // 1 to 10
  subskills: string[];
  x: number;
  y: number;
  description: string;
}

export default function TechTree({ stats, repositories }: TechTreeProps) {
  // Compute RPG skills dynamically from GitHub statistics
  const skillNodes = useMemo<SkillNode[]>(() => {
    // Frontend
    const hasWebLangs = stats.topLanguages.some(l => 
      ['TypeScript', 'JavaScript', 'HTML', 'CSS'].includes(l.language)
    );
    const frontendLvl = Math.min(10, Math.max(2, (hasWebLangs ? 7 : 3) + Math.min(3, Math.floor(stats.totalStars / 15))));

    // Backend
    const backendLvl = Math.min(10, Math.max(2, (repositories.length > 4 ? 6 : 3) + Math.min(4, Math.floor(stats.totalForks / 8)) + 1));

    // AI
    const aiLvl = Math.min(10, Math.max(1, Math.round((stats.aiScore - 40) / 6)));

    // DevOps
    const devopsLvl = Math.min(10, Math.max(1, Math.floor(repositories.length * 0.3) + Math.min(4, Math.floor(stats.totalStars / 25)) + 1));

    // Algorithms
    const algoLvl = Math.min(10, Math.max(2, Math.floor(stats.streak * 0.2) + Math.min(4, stats.topLanguages.length)));

    return [
      {
        id: 'fe',
        name: 'FRONTEND',
        level: frontendLvl,
        subskills: ['React', 'Next.js', 'CSS'],
        x: 60,
        y: 30,
        description: 'Visual interfaces and client layouts.'
      },
      {
        id: 'be',
        name: 'BACKEND',
        level: backendLvl,
        subskills: ['APIs', 'Databases', 'Node'],
        x: 200,
        y: 30,
        description: 'Server logics and data pipelines.'
      },
      {
        id: 'ai',
        name: 'AI LOGIC',
        level: aiLvl,
        subskills: ['Gemini', 'LLMs', 'Python'],
        x: 60,
        y: 130,
        description: 'LLM integration and prompt scripts.'
      },
      {
        id: 'do',
        name: 'DEVOPS',
        level: devopsLvl,
        subskills: ['Actions', 'Docker', 'Vercel'],
        x: 200,
        y: 130,
        description: 'CI/CD flows and server deployments.'
      },
      {
        id: 'al',
        name: 'ALGORITHMS',
        level: algoLvl,
        subskills: ['Structure', 'Logic', 'Clean Code'],
        x: 130,
        y: 80,
        description: 'System complexity and data optimization.'
      }
    ];
  }, [stats, repositories]);

  // SVG dimensions
  const width = 260;
  const height = 160;

  // Connection links representing skill paths
  const treeLinks = [
    { from: 'al', to: 'fe' },
    { from: 'al', to: 'be' },
    { from: 'al', to: 'ai' },
    { from: 'al', to: 'do' },
    { from: 'fe', to: 'be' },
    { from: 'ai', to: 'do' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 select-none">
      
      {/* Skill Map SVG Overlay */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[145px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[250px] overflow-visible">
          {/* Background RPG wiring paths */}
          {treeLinks.map((link, idx) => {
            const fromNode = skillNodes.find(n => n.id === link.from);
            const toNode = skillNodes.find(n => n.id === link.to);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#151518"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Active branch indicators */}
          {treeLinks.map((link, idx) => {
            const fromNode = skillNodes.find(n => n.id === link.from);
            const toNode = skillNodes.find(n => n.id === link.to);
            if (!fromNode || !toNode) return null;

            // Highlight path if both levels are reasonably unlocked
            const isPathActive = fromNode.level >= 4 && toNode.level >= 4;
            if (!isPathActive) return null;

            return (
              <line
                key={`active-${idx}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#9FE870"
                strokeWidth={1}
                opacity={0.25}
              />
            );
          })}

          {/* Interactive RPG Node badging */}
          {skillNodes.map((node) => {
            // Unlocked check: level > 0
            const glowColor = node.level >= 7 ? '#9FE870' : '#ffffff';

            return (
              <g key={node.id} className="group cursor-help">
                <title>{`${node.name}: LVL ${node.level}/10 - ${node.description}`}</title>
                
                {/* Node Ring wrapper */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  fill="#090909"
                  stroke={node.level >= 5 ? glowColor : '#1f1f23'}
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />

                {/* Node Core Core */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={6}
                  fill={node.level >= 5 ? glowColor : '#151518'}
                  className="transition-all duration-200 group-hover:scale-125"
                  style={{
                    boxShadow: node.level >= 7 ? `0 0 10px ${glowColor}` : undefined
                  }}
                />

                {/* Node Label Text */}
                <text
                  x={node.x}
                  y={node.y - 17}
                  textAnchor="middle"
                  className="fill-neutral-500 font-mono text-[7px] font-bold tracking-widest uppercase transition-colors group-hover:fill-white"
                >
                  {node.name}
                </text>
                
                {/* Level Overlay Badge inside node circle */}
                <text
                  x={node.x}
                  y={node.y + 22}
                  textAnchor="middle"
                  className="fill-neutral-400 font-mono text-[8px] font-bold"
                >
                  {`L.${node.level}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Retro Skill Progress Block indicators */}
      <div className="w-full space-y-1.5 mt-2 max-w-[240px]">
        {skillNodes.map((node) => {
          // Render character status grid blocks: ████████░░
          const filledBlocks = '█'.repeat(node.level);
          const emptyBlocks = '░'.repeat(10 - node.level);

          return (
            <div key={node.id} className="flex items-center justify-between text-[9px] font-mono leading-none">
              <span className="text-neutral-500 font-semibold uppercase">{node.name.padEnd(10, ' ')}</span>
              <span className="text-neutral-700 tracking-tighter">
                <span className="text-[#9FE870]">{filledBlocks}</span>
                <span>{emptyBlocks}</span>
              </span>
              <span className="text-white font-bold">{node.level * 10}%</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
