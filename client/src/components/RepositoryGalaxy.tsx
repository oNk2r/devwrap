import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DevWrapRepo } from '../types/github';

interface RepositoryGalaxyProps {
  repositories: DevWrapRepo[];
  avatarUrl: string;
}

// Map languages to aesthetic colors
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#F05138',
};

const DEFAULT_COLOR = '#8b5cf6'; // fallback purple

const renderLanguageLogo = (lang: string, size: number) => {
  let monogram = lang.slice(0, 2).toUpperCase();
  if (lang.toLowerCase() === 'c++') monogram = 'C+';
  if (lang.toLowerCase() === 'c#') monogram = 'C#';
  if (lang.toLowerCase() === 'javascript') monogram = 'JS';
  if (lang.toLowerCase() === 'typescript') monogram = 'TS';
  if (lang.toLowerCase() === 'python') monogram = 'PY';
  if (lang.toLowerCase() === 'html') monogram = 'HT';
  if (lang.toLowerCase() === 'css') monogram = 'CS';

  // Font size scales with planet radius (size is radius)
  const fontSize = Math.max(9, Math.min(14, size * 0.9));

  return (
    <span 
      className="font-sans font-extrabold select-none leading-none tracking-tighter"
      style={{ 
        fontSize: `${fontSize}px`,
        color: '#060608',
      }}
    >
      {monogram}
    </span>
  );
};

export default function RepositoryGalaxy({ repositories, avatarUrl }: RepositoryGalaxyProps) {
  const [hoveredRepo, setHoveredRepo] = useState<DevWrapRepo | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Filter out forks and pick top 8-10 repositories sorted by stars/updates
  const planets = useMemo(() => {
    const sorted = [...repositories]
      .sort((a, b) => b.stars - a.stars || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return sorted.slice(0, 8).map((repo, index) => {
      // Orbit configuration
      const baseRadius = 45;
      const spacing = 20;
      const radius = baseRadius + index * spacing;
      
      // Speed - closer orbits are faster
      const duration = 12 + index * 6 + (index % 2 === 0 ? 2 : -2);
      
      // Starting angle spread out evenly
      const startAngle = (index * 2 * Math.PI) / 8;
      
      // Planet size based on stars
      const planetSize = 10 + Math.min(10, repo.stars * 1.8);

      // Color mapping
      const color = LANGUAGE_COLORS[repo.language] || DEFAULT_COLOR;

      return {
        ...repo,
        orbitRadius: radius,
        duration,
        startAngle,
        size: planetSize,
        color,
      };
    });
  }, [repositories]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 15,
    });
  };

  return (
    <div 
      className="w-full h-full min-h-[360px] flex items-center justify-center relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Inline styles for orbital rotation animation */}
      <style>{`
        @keyframes galaxy-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counter-rotate {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .galaxy-ring-animation {
          animation: galaxy-orbit var(--duration, 20s) linear infinite;
        }
        .galaxy-ring-animation:hover {
          animation-play-state: paused;
        }
        .planet-counter-animation {
          animation: counter-rotate var(--duration, 20s) linear infinite;
        }
        .galaxy-ring-animation:hover .planet-counter-animation {
          animation-play-state: paused;
        }
      `}</style>

      {/* Galaxy Container */}
      <div className="relative w-[380px] h-[380px] flex items-center justify-center scale-95 md:scale-100">
        
        {/* Orbits and Planets */}
        {planets.map((planet) => (
          <div
            key={planet.id}
            className="absolute rounded-full border border-neutral-800 pointer-events-none"
            style={{
              width: planet.orbitRadius * 2,
              height: planet.orbitRadius * 2,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderStyle: 'dashed',
              borderWidth: '0.75px',
            }}
          />
        ))}

        {/* Orbit container wrappers that rotate */}
        {planets.map((planet) => {
          const rotationAngleDegrees = (planet.startAngle * 180) / Math.PI;

          return (
            <div
              key={planet.id}
              className="absolute w-full h-full flex items-center justify-center pointer-events-none"
              style={{
                transform: `rotate(${rotationAngleDegrees}deg)`,
              }}
            >
              <div
                className="galaxy-ring-animation absolute w-full h-full flex items-center justify-center pointer-events-none"
                style={{
                  // Pass duration down as a custom property
                  ['--duration' as any]: `${planet.duration}s`,
                }}
              >
                {/* Planet positioned along the orbit radius */}
                <div
                  className="absolute cursor-pointer flex items-center justify-center pointer-events-auto"
                  style={{
                    transform: `translateX(${planet.orbitRadius}px)`,
                  }}
                  onMouseEnter={() => setHoveredRepo(planet)}
                  onMouseLeave={() => setHoveredRepo(null)}
                >
                  <motion.div
                    whileHover={{ scale: 1.4 }}
                    className="planet-counter-animation rounded-full relative flex items-center justify-center overflow-hidden"
                    style={{
                      width: planet.size * 2,
                      height: planet.size * 2,
                      backgroundColor: planet.color,
                      boxShadow: `0 0 12px ${planet.color}80`,
                      ['--duration' as any]: `${planet.duration}s`,
                    }}
                  >
                    {renderLanguageLogo(planet.language, planet.size)}
                  </motion.div>
                  
                  {/* Subtle language orbit tag text on hover */}
                  {hoveredRepo?.id === planet.id && (
                    <div className="absolute text-[10px] font-mono text-neutral-500 whitespace-nowrap mt-7 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-900">
                      {planet.language}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Central Core (User Avatar / Sun) */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 15px rgba(255,255,255,0.05)',
              '0 0 25px rgba(255,255,255,0.15)',
              '0 0 15px rgba(255,255,255,0.05)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center p-0.5 relative z-10 select-none overflow-hidden"
        >
          <img
            src={avatarUrl}
            alt="Central Core"
            className="w-full h-full rounded-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-300"
          />
        </motion.div>

        {/* Floating Tooltip Details Card */}
        <AnimatePresence>
          {hoveredRepo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 pointer-events-none p-3.5 bg-neutral-950/95 border border-neutral-900 rounded-xl shadow-2xl flex flex-col gap-1.5 w-52 font-mono text-[11px]"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
              }}
            >
              <span className="text-white font-bold truncate tracking-tight">
                {hoveredRepo.name}
              </span>
              <p className="text-neutral-500 font-sans line-clamp-2 leading-tight">
                {hoveredRepo.description}
              </p>
              
              <div className="flex items-center justify-between border-t border-neutral-900/80 pt-1.5 mt-1 text-neutral-400">
                <span className="flex items-center gap-1 font-semibold">
                  <span 
                    className="w-1.5 h-1.5 rounded-full inline-block" 
                    style={{ backgroundColor: LANGUAGE_COLORS[hoveredRepo.language] || DEFAULT_COLOR }}
                  />
                  {hoveredRepo.language}
                </span>
                
                <div className="flex items-center gap-2">
                  {hoveredRepo.stars > 0 && (
                    <span>★ {hoveredRepo.stars}</span>
                  )}
                  {hoveredRepo.forks > 0 && (
                    <span>⑂ {hoveredRepo.forks}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
