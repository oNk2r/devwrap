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
}

export default function SankeyDiagram({ stats }: SankeyDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const evolutionPath = useMemo(() => {
    const primaryLang = stats.topLanguages[0]?.language || 'TypeScript';

    if (primaryLang === 'Python') {
      return {
        nodes: [
          { id: 'n1', label: 'Python', col: 0, y: 0.3, color: '#3572A5' },
          { id: 'n2', label: 'C / C++', col: 0, y: 0.7, color: '#555555' },
          { id: 'n3', label: 'Pandas', col: 1, y: 0.25, color: '#150458' },
          { id: 'n4', label: 'FastAPI', col: 1, y: 0.75, color: '#059669' },
          { id: 'n5', label: 'AI Engineering', col: 2, y: 0.35, color: '#8b5cf6' },
          { id: 'n6', label: 'PyTorch', col: 2, y: 0.65, color: '#EE4C2C' },
          { id: 'n7', label: 'Gemini API', col: 3, y: 0.5, color: '#9FE870' },
        ],
        links: [
          { source: 'n1', target: 'n3', value: 8, gradientId: 'g-py-pd' },
          { source: 'n1', target: 'n4', value: 6, gradientId: 'g-py-fa' },
          { source: 'n2', target: 'n4', value: 4, gradientId: 'g-c-fa' },
          { source: 'n3', target: 'n5', value: 7, gradientId: 'g-pd-ai' },
          { source: 'n3', target: 'n6', value: 5, gradientId: 'g-pd-pt' },
          { source: 'n4', target: 'n6', value: 6, gradientId: 'g-fa-pt' },
          { source: 'n5', target: 'n7', value: 10, gradientId: 'g-ai-gem' },
          { source: 'n6', target: 'n7', value: 8, gradientId: 'g-pt-gem' },
        ]
      };
    } else if (['Rust', 'Go', 'C++', 'C'].includes(primaryLang)) {
      return {
        nodes: [
          { id: 'n1', label: 'C / C++', col: 0, y: 0.3, color: '#555555' },
          { id: 'n2', label: 'Python', col: 0, y: 0.7, color: '#3572A5' },
          { id: 'n3', label: 'Go Lang', col: 1, y: 0.25, color: '#00ADD8' },
          { id: 'n4', label: 'Rust System', col: 1, y: 0.75, color: '#dea584' },
          { id: 'n5', label: 'gRPC Modules', col: 2, y: 0.35, color: '#f43f5e' },
          { id: 'n6', label: 'WebAssembly', col: 2, y: 0.65, color: '#6366f1' },
          { id: 'n7', label: 'Gemini API', col: 3, y: 0.5, color: '#9FE870' },
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
      // Default Web Dev route (TypeScript, JS, HTML, CSS, etc.)
      return {
        nodes: [
          { id: 'n1', label: 'HTML & CSS', col: 0, y: 0.3, color: '#e34c26' },
          { id: 'n2', label: 'JavaScript', col: 0, y: 0.7, color: '#f1e05a' },
          { id: 'n3', label: 'React JS', col: 1, y: 0.25, color: '#61dafb' },
          { id: 'n4', label: 'Node Backend', col: 1, y: 0.75, color: '#339933' },
          { id: 'n5', label: 'Next.js App', col: 2, y: 0.35, color: '#ffffff' },
          { id: 'n6', label: 'TypeScript', col: 2, y: 0.65, color: '#3178c6' },
          { id: 'n7', label: 'Gemini API', col: 3, y: 0.5, color: '#9FE870' },
        ],
        links: [
          { source: 'n1', target: 'n3', value: 8, gradientId: 'g-hc-re' },
          { source: 'n2', target: 'n3', value: 6, gradientId: 'g-js-re' },
          { source: 'n2', target: 'n4', value: 6, gradientId: 'g-js-nd' },
          { source: 'n3', target: 'n5', value: 8, gradientId: 'g-re-nx' },
          { source: 'n3', target: 'n6', value: 5, gradientId: 'g-re-ts' },
          { source: 'n4', target: 'n6', value: 7, gradientId: 'g-nd-ts' },
          { source: 'n5', target: 'n7', value: 10, gradientId: 'g-nx-gem' },
          { source: 'n6', target: 'n7', value: 8, gradientId: 'g-ts-gem' },
        ]
      };
    }
  }, [stats]);

  const width = 460;
  const height = 200;
  const paddingX = 40;
  const paddingY = 32;

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

      // Draw smooth Bezier curve for flow link
      const controlX = (x1 + x2) / 2;
      const path = `M ${x1} ${y1} C ${controlX} ${y1}, ${controlX} ${y2}, ${x2} ${y2}`;

      // Check hover states to highlight connected flows
      let opacity = 0.15;
      let strokeWidth = link.value * 0.7;
      let isHighlighted = false;

      if (hoveredNode) {
        if (link.source === hoveredNode || link.target === hoveredNode) {
          opacity = 0.7;
          strokeWidth = link.value * 0.9;
          isHighlighted = true;
        } else {
          opacity = 0.04;
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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3 select-none">
      
      {/* SVG Canvas */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          {/* Create Linear Gradients for links */}
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

        {/* Links Flow Paths */}
        {linkPaths.map((link, idx) => {
          if (!link) return null;
          return (
            <g key={idx}>
              {/* Background gradient track */}
              <path
                d={link.path}
                fill="none"
                stroke={`url(#${link.gradientId})`}
                strokeWidth={link.strokeWidth}
                style={{ opacity: link.opacity }}
                className="transition-all duration-300"
              />
              
              {/* Flowing animated dash particles */}
              {(hoveredNode === null || link.isHighlighted) && (
                <path
                  d={link.path}
                  fill="none"
                  stroke={`url(#${link.gradientId})`}
                  strokeWidth={Math.max(1.5, link.strokeWidth * 0.35)}
                  strokeDasharray="4 12"
                  strokeDashoffset="0"
                  style={{ opacity: hoveredNode ? 0.9 : 0.4 }}
                  className="transition-all duration-300"
                >
                  <animate
                    attributeName="strokeDashoffset"
                    values="100;0"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </path>
              )}
            </g>
          );
        })}

        {/* Nodes and Labels */}
        {Object.values(nodeCoords).map((coord, idx) => {
          const { x, y, node } = coord;
          const isNodeHovered = hoveredNode === node.id;
          const isSomeNodeHovered = hoveredNode !== null;
          
          let nodeOpacity = 1;
          if (isSomeNodeHovered && !isNodeHovered) {
            // check if connected
            const isConnected = evolutionPath.links.some(l => 
              (l.source === node.id && l.target === hoveredNode) || 
              (l.target === node.id && l.source === hoveredNode)
            );
            nodeOpacity = isConnected ? 0.95 : 0.35;
          }

          return (
            <g 
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ opacity: nodeOpacity }}
            >
              {/* Node Dot with pulsing shape */}
              <circle
                cx={x}
                cy={y}
                r={5.5}
                fill={node.color}
                stroke="#090909"
                strokeWidth={1.5}
                className="transition-all duration-200"
              />
              {isNodeHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r={11}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={1}
                  className="animate-ping"
                />
              )}

              {/* Node Name Label */}
              <text
                x={node.col === 3 ? x - 8 : node.col === 0 ? x + 8 : x}
                y={y - 11}
                textAnchor={node.col === 3 ? 'end' : node.col === 0 ? 'start' : 'middle'}
                className="fill-neutral-400 font-mono text-xs font-medium tracking-tight select-none transition-colors duration-200"
                style={{
                  fill: isNodeHovered ? '#ffffff' : undefined,
                  fontWeight: isNodeHovered ? 'bold' : undefined,
                }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
