import { useState, useMemo } from 'react';
import type { DevWrapStats } from '../types/github';

interface SankeyDiagramProps {
  stats: DevWrapStats;
}

interface Node {
  id: string;
  label: string;
  col: number; // 0, 1, 2, 3
  y: number;   // normalized y position (0 to 1)
  color: string;
  category: string;
}

export default function SankeyDiagram({ stats }: SankeyDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const evolutionPath = useMemo(() => {
    const primaryLang = stats.topLanguages[0]?.language || 'TypeScript';

    if (primaryLang === 'Python') {
      return {
        nodes: [
          { id: 'n1', label: 'Python 3', col: 0, y: 0.3, color: '#3572A5', category: 'Foundation' },
          { id: 'n2', label: 'C / C++', col: 0, y: 0.7, color: '#64748b', category: 'Foundation' },
          { id: 'n3', label: 'Pandas & NumPy', col: 1, y: 0.25, color: '#38BDF8', category: 'Core Stack' },
          { id: 'n4', label: 'FastAPI / Flask', col: 1, y: 0.75, color: '#00F5A0', category: 'Core Stack' },
          { id: 'n5', label: 'PyTorch / ML', col: 2, y: 0.32, color: '#FB923C', category: 'Frameworks' },
          { id: 'n6', label: 'LangChain / RAG', col: 2, y: 0.68, color: '#C084FC', category: 'Frameworks' },
          { id: 'n7', label: 'Gemini / Claude AI', col: 3, y: 0.5, color: '#FFDE59', category: 'AI Ecosystem' },
        ],
        links: [
          { source: 'n1', target: 'n3', value: 8, gradientId: 'g-py-pd' },
          { source: 'n1', target: 'n4', value: 6, gradientId: 'g-py-fa' },
          { source: 'n2', target: 'n4', value: 4, gradientId: 'g-c-fa' },
          { source: 'n3', target: 'n5', value: 7, gradientId: 'g-pd-pt' },
          { source: 'n3', target: 'n6', value: 5, gradientId: 'g-pd-lc' },
          { source: 'n4', target: 'n6', value: 6, gradientId: 'g-fa-lc' },
          { source: 'n5', target: 'n7', value: 9, gradientId: 'g-pt-gem' },
          { source: 'n6', target: 'n7', value: 9, gradientId: 'g-lc-gem' },
        ]
      };
    } else if (['Rust', 'Go', 'C++', 'C'].includes(primaryLang)) {
      return {
        nodes: [
          { id: 'n1', label: 'C / C++', col: 0, y: 0.3, color: '#64748b', category: 'Foundation' },
          { id: 'n2', label: 'Python Scripts', col: 0, y: 0.7, color: '#3572A5', category: 'Foundation' },
          { id: 'n3', label: 'Go Concurrency', col: 1, y: 0.25, color: '#00ADD8', category: 'Core Stack' },
          { id: 'n4', label: 'Rust Engine', col: 1, y: 0.75, color: '#f97316', category: 'Core Stack' },
          { id: 'n5', label: 'gRPC & Microservices', col: 2, y: 0.32, color: '#f43f5e', category: 'Frameworks' },
          { id: 'n6', label: 'WebAssembly WASM', col: 2, y: 0.68, color: '#818cf8', category: 'Frameworks' },
          { id: 'n7', label: 'Gemini / Cloud AI', col: 3, y: 0.5, color: '#00F5A0', category: 'AI Ecosystem' },
        ],
        links: [
          { source: 'n1', target: 'n3', value: 8, gradientId: 'g-c-go' },
          { source: 'n1', target: 'n4', value: 7, gradientId: 'g-c-ru' },
          { source: 'n2', target: 'n4', value: 5, gradientId: 'g-py-ru' },
          { source: 'n3', target: 'n5', value: 8, gradientId: 'g-go-grpc' },
          { source: 'n4', target: 'n5', value: 4, gradientId: 'g-ru-grpc' },
          { source: 'n4', target: 'n6', value: 7, gradientId: 'g-ru-wasm' },
          { source: 'n5', target: 'n7', value: 9, gradientId: 'g-grpc-gem' },
          { source: 'n6', target: 'n7', value: 7, gradientId: 'g-wasm-gem' },
        ]
      };
    } else {
      // Default Web & Modern Full Stack (TypeScript, JS, React, Node)
      return {
        nodes: [
          { id: 'n1', label: 'HTML & CSS', col: 0, y: 0.3, color: '#e34c26', category: 'Foundation' },
          { id: 'n2', label: 'JavaScript (ES6)', col: 0, y: 0.7, color: '#eab308', category: 'Foundation' },
          { id: 'n3', label: 'React & UI Components', col: 1, y: 0.25, color: '#38BDF8', category: 'Core Stack' },
          { id: 'n4', label: 'Node & Express', col: 1, y: 0.75, color: '#22c55e', category: 'Core Stack' },
          { id: 'n5', label: 'Next.js & Fullstack', col: 2, y: 0.32, color: '#000000', category: 'Frameworks' },
          { id: 'n6', label: 'TypeScript Systems', col: 2, y: 0.68, color: '#3178c6', category: 'Frameworks' },
          { id: 'n7', label: 'Gemini AI & SDKs', col: 3, y: 0.5, color: '#C084FC', category: 'AI Ecosystem' },
        ],
        links: [
          { source: 'n1', target: 'n3', value: 8, gradientId: 'g-hc-re' },
          { source: 'n2', target: 'n3', value: 6, gradientId: 'g-js-re' },
          { source: 'n2', target: 'n4', value: 6, gradientId: 'g-js-nd' },
          { source: 'n3', target: 'n5', value: 8, gradientId: 'g-re-nx' },
          { source: 'n3', target: 'n6', value: 5, gradientId: 'g-re-ts' },
          { source: 'n4', target: 'n6', value: 7, gradientId: 'g-nd-ts' },
          { source: 'n5', target: 'n7', value: 9, gradientId: 'g-nx-gem' },
          { source: 'n6', target: 'n7', value: 8, gradientId: 'g-ts-gem' },
        ]
      };
    }
  }, [stats]);

  const width = 560;
  const height = 260;
  const paddingX = 50;
  const paddingY = 40;

  const colWidth = (width - paddingX * 2) / 3;

  // Resolve coordinate mapping for nodes
  const nodeCoords = useMemo(() => {
    const coords: Record<string, { x: number; y: number; node: Node }> = {};
    evolutionPath.nodes.forEach(node => {
      const x = paddingX + node.col * colWidth;
      const y = paddingY + node.y * (height - paddingY * 2);
      coords[node.id] = { x, y, node };
    });
    return coords;
  }, [evolutionPath, colWidth, height]);

  // Generate links SVG paths
  const linkPaths = useMemo(() => {
    return evolutionPath.links.map(link => {
      const source = nodeCoords[link.source];
      const target = nodeCoords[link.target];
      if (!source || !target) return null;

      const x1 = source.x;
      const y1 = source.y;
      const x2 = target.x;
      const y2 = target.y;

      const controlX = (x1 + x2) / 2;
      const path = `M ${x1} ${y1} C ${controlX} ${y1}, ${controlX} ${y2}, ${x2} ${y2}`;

      let opacity = 0.25;
      let strokeWidth = link.value * 0.8;
      let isHighlighted = false;

      if (hoveredNode) {
        if (link.source === hoveredNode || link.target === hoveredNode) {
          opacity = 0.85;
          strokeWidth = link.value * 1.1;
          isHighlighted = true;
        } else {
          opacity = 0.08;
        }
      }

      return {
        ...link,
        path,
        opacity,
        strokeWidth,
        isHighlighted,
        sourceColor: source.node.color,
        targetColor: target.node.color,
      };
    });
  }, [evolutionPath, nodeCoords, hoveredNode]);

  const stageTitles = ['1. Foundations', '2. Core Stacks', '3. Frameworks', '4. AI Ecosystem'];

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Stage Headers */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-[560px] mb-2 text-center">
        {stageTitles.map((title) => (
          <div key={title} className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-600 bg-neutral-100 py-1 px-2 rounded-lg border border-black/30">
            {title}
          </div>
        ))}
      </div>

      {/* SVG Canvas */}
      <div className="w-full max-w-[560px] bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            {linkPaths.map((link, idx) => {
              if (!link) return null;
              return (
                <linearGradient
                  key={idx}
                  id={link.gradientId}
                  x1="0%" y1="0%" x2="100%" y2="0%"
                >
                  <stop offset="0%" stopColor={link.sourceColor} />
                  <stop offset="100%" stopColor={link.targetColor} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Flow Links */}
          {linkPaths.map((link, idx) => {
            if (!link) return null;
            return (
              <g key={idx}>
                {/* Background ribbon curve */}
                <path
                  d={link.path}
                  fill="none"
                  stroke={`url(#${link.gradientId})`}
                  strokeWidth={link.strokeWidth}
                  style={{ opacity: link.opacity }}
                  className="transition-all duration-300"
                />

                {/* Animated dash flow */}
                <path
                  d={link.path}
                  fill="none"
                  stroke={`url(#${link.gradientId})`}
                  strokeWidth={Math.max(1.5, link.strokeWidth * 0.4)}
                  strokeDasharray="4 8"
                  style={{ opacity: hoveredNode ? 0.95 : 0.6 }}
                  className="transition-all duration-300"
                >
                  <animate
                    attributeName="strokeDashoffset"
                    values="100;0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            );
          })}

          {/* Nodes */}
          {Object.values(nodeCoords).map((coord, idx) => {
            const { x, y, node } = coord;
            const isNodeHovered = hoveredNode === node.id;
            const isSomeNodeHovered = hoveredNode !== null;

            let nodeOpacity = 1;
            if (isSomeNodeHovered && !isNodeHovered) {
              const isConnected = evolutionPath.links.some(l =>
                (l.source === node.id && l.target === hoveredNode) ||
                (l.target === node.id && l.source === hoveredNode)
              );
              nodeOpacity = isConnected ? 1 : 0.3;
            }

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ opacity: nodeOpacity }}
              >
                {/* Node Outer Ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isNodeHovered ? 8 : 6}
                  fill={node.color}
                  stroke="#000000"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />

                {/* Node Pill / Text Label */}
                <text
                  x={node.col === 3 ? x - 10 : node.col === 0 ? x + 10 : x}
                  y={y - 12}
                  textAnchor={node.col === 3 ? 'end' : node.col === 0 ? 'start' : 'middle'}
                  className="font-sans text-[11px] font-extrabold select-none transition-all fill-neutral-900"
                  style={{
                    fontWeight: isNodeHovered ? '900' : '700',
                  }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
