import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Star, GitFork, Orbit, LayoutGrid } from 'lucide-react';
import type { DevWrapRepo } from '../types/github';

interface RepositoryGalaxyProps {
  repositories: DevWrapRepo[];
  avatarUrl: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#eab308',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#f97316',
  HTML: '#e34c26',
  CSS: '#8b5cf6',
  Java: '#b07219',
  Ruby: '#dc2626',
  PHP: '#4F5D95',
  C: '#64748b',
  'C++': '#f43f5e',
  'C#': '#16a34a',
  Swift: '#F05138',
  Kotlin: '#a855f7',
  Dart: '#0284c7',
};

const DEFAULT_COLOR = '#8b5cf6';

export default function RepositoryGalaxy({ repositories, avatarUrl }: RepositoryGalaxyProps) {
  const [viewMode, setViewMode] = useState<'orbit' | 'grid'>('orbit');
  const [hoveredRepo, setHoveredRepo] = useState<DevWrapRepo | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Available unique languages
  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    repositories.forEach(r => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set);
  }, [repositories]);

  // Filtered repositories
  const filteredRepos = useMemo(() => {
    if (selectedLanguage === 'all') return repositories;
    return repositories.filter(r => r.language === selectedLanguage);
  }, [repositories, selectedLanguage]);

  // Planetary configuration for Orbit view (top 8 repos)
  const planets = useMemo(() => {
    const sorted = [...repositories]
      .sort((a, b) => b.stars - a.stars || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return sorted.slice(0, 8).map((repo, index) => {
      const baseRadius = 55;
      const spacing = 22;
      const radius = baseRadius + index * spacing;
      const duration = 16 + index * 6;
      const startAngle = (index * 2 * Math.PI) / 8;
      const planetSize = 12 + Math.min(12, repo.stars * 1.5);
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

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black border-dashed">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('orbit')}
            className={`neo-btn px-3 py-1.5 text-xs ${viewMode === 'orbit' ? 'neo-btn-primary' : 'bg-white'}`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Solar Orbit</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`neo-btn px-3 py-1.5 text-xs ${viewMode === 'grid' ? 'neo-btn-primary' : 'bg-white'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Card Grid ({repositories.length})</span>
          </button>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-2.5 py-1 text-xs font-bold rounded-full border-2 border-black transition-all cursor-pointer ${
              selectedLanguage === 'all' ? 'bg-black text-white shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-neutral-100'
            }`}
          >
            All
          </button>
          {allLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-bold rounded-full border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedLanguage === lang ? 'bg-black text-white shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-neutral-100'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: LANGUAGE_COLORS[lang] || DEFAULT_COLOR }}
              />
              <span>{lang}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orbit View */}
      {viewMode === 'orbit' && (
        <div className="relative w-full min-h-[460px] bg-gradient-to-b from-[#FAF8F5] to-[#F2EFE9] border-2 border-black rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden shadow-[4px_4px_0px_#000]">
          {/* Keyframe animations for orbits */}
          <style>{`
            @keyframes neo-orbit {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes neo-counter {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
            .orbit-ring-anim {
              animation: neo-orbit var(--duration, 20s) linear infinite;
            }
            .orbit-ring-anim:hover {
              animation-play-state: paused;
            }
            .planet-counter-anim {
              animation: neo-counter var(--duration, 20s) linear infinite;
            }
            .orbit-ring-anim:hover .planet-counter-anim {
              animation-play-state: paused;
            }
          `}</style>

          {/* Galaxy Canvas */}
          <div className="relative w-[440px] h-[440px] flex items-center justify-center scale-90 sm:scale-100">
            {/* Dashed Orbit Circles */}
            {planets.map((planet) => (
              <div
                key={`ring-${planet.id}`}
                className="absolute rounded-full border border-neutral-300 pointer-events-none"
                style={{
                  width: planet.orbitRadius * 2,
                  height: planet.orbitRadius * 2,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderStyle: 'dashed',
                  borderWidth: '1.5px',
                }}
              />
            ))}

            {/* Orbit Container with Planets */}
            {planets.map((planet) => {
              const rotationAngleDegrees = (planet.startAngle * 180) / Math.PI;

              return (
                <div
                  key={`planet-orbit-${planet.id}`}
                  className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `rotate(${rotationAngleDegrees}deg)`,
                  }}
                >
                  <div
                    className="orbit-ring-anim absolute w-full h-full flex items-center justify-center pointer-events-none"
                    style={{ '--duration': `${planet.duration}s` } as React.CSSProperties}
                  >
                    {/* Planet Node */}
                    <div
                      className="absolute cursor-pointer flex items-center justify-center pointer-events-auto"
                      style={{
                        transform: `translateX(${planet.orbitRadius}px)`,
                      }}
                      onMouseEnter={() => setHoveredRepo(planet)}
                      onMouseLeave={() => setHoveredRepo(null)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.35 }}
                        className="planet-counter-anim rounded-full border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] relative"
                        style={{
                          width: planet.size * 2,
                          height: planet.size * 2,
                          backgroundColor: planet.color,
                          '--duration': `${planet.duration}s`,
                        } as React.CSSProperties}
                      >
                        <span className="text-[10px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] select-none">
                          {planet.name.slice(0, 2).toUpperCase()}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Central Sun / Developer Core */}
            <div className="w-18 h-18 rounded-full bg-white border-2 border-black p-1 relative z-10 shadow-[4px_4px_0px_#000] flex items-center justify-center">
              <img
                src={avatarUrl}
                alt="Dev Core"
                className="w-full h-full rounded-full object-cover border border-black"
              />
            </div>
          </div>

          {/* Hovered Planet Card Overlay */}
          <AnimatePresence>
            {hoveredRepo && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 bg-white border-2 border-black rounded-xl p-3.5 shadow-[4px_4px_0px_#000] max-w-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-extrabold text-sm truncate">{hoveredRepo.name}</h4>
                  <a
                    href={hoveredRepo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-neutral-100 rounded border border-black"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-neutral-600 line-clamp-2 mb-2">
                  {hoveredRepo.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-black/20">
                  <span className="neo-badge text-[10px] py-0.5 px-2" style={{ backgroundColor: LANGUAGE_COLORS[hoveredRepo.language] || DEFAULT_COLOR, color: '#FFFFFF' }}>
                    {hoveredRepo.language || 'Unknown'}
                  </span>
                  <div className="flex items-center gap-2.5 font-bold font-mono text-[11px]">
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {hoveredRepo.stars}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-600">
                      <GitFork className="w-3 h-3" />
                      {hoveredRepo.forks}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => {
            const langColor = LANGUAGE_COLORS[repo.language] || DEFAULT_COLOR;
            return (
              <div
                key={repo.id}
                className="neo-card p-4 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm tracking-tight text-neutral-900 line-clamp-1">
                      {repo.name}
                    </h3>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:bg-neutral-100 rounded border border-black shrink-0"
                      title="View on GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
                    {repo.description || 'No description provided for this repository.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-black border-dashed">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-black"
                      style={{ backgroundColor: langColor }}
                    />
                    <span>{repo.language || 'Other'}</span>
                  </span>

                  <div className="flex items-center gap-3 font-mono text-xs font-bold">
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-700">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
