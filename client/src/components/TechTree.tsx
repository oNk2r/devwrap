import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Server, Brain, Workflow, Cpu } from 'lucide-react';
import type { DevWrapStats, DevWrapRepo } from '../types/github';

interface TechTreeProps {
  stats: DevWrapStats;
  repositories: DevWrapRepo[];
}

export default function TechTree({ stats, repositories }: TechTreeProps) {
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  // Compute RPG skills dynamically from GitHub statistics
  const skillNodes = useMemo(() => {
    // Frontend
    const hasWebLangs = stats.topLanguages.some(l =>
      ['TypeScript', 'JavaScript', 'HTML', 'CSS'].includes(l.language)
    );
    const frontendLvl = Math.min(10, Math.max(2, (hasWebLangs ? 7 : 3) + Math.min(3, Math.floor(stats.totalStars / 15))));

    // Backend
    const backendLvl = Math.min(10, Math.max(2, (repositories.length > 4 ? 6 : 3) + Math.min(4, Math.floor(stats.totalForks / 8)) + 1));

    // AI
    const aiLvl = Math.min(10, Math.max(1, Math.round((stats.aiScore - 30) / 7)));

    // DevOps
    const devopsLvl = Math.min(10, Math.max(1, Math.floor(repositories.length * 0.3) + Math.min(4, Math.floor(stats.totalStars / 25)) + 1));

    // Algorithms
    const algoLvl = Math.min(10, Math.max(2, Math.floor(stats.streak * 0.2) + Math.min(4, stats.topLanguages.length)));

    return [
      {
        id: 'fe',
        name: 'Frontend Architecture',
        shortName: 'Frontend',
        level: frontendLvl,
        icon: Layers,
        color: '#38BDF8',
        subskills: ['React', 'Next.js', 'Tailwind', 'State Flow'],
        desc: 'Component hierarchies, responsive interfaces, and client performance.'
      },
      {
        id: 'be',
        name: 'Backend Services',
        shortName: 'Backend',
        level: backendLvl,
        icon: Server,
        color: '#00F5A0',
        subskills: ['REST APIs', 'Node / Express', 'Databases', 'Auth'],
        desc: 'Data pipelines, server routing, database queries, and caching.'
      },
      {
        id: 'ai',
        name: 'AI & Generative Logic',
        shortName: 'AI Engineering',
        level: aiLvl,
        icon: Brain,
        color: '#C084FC',
        subskills: ['Gemini API', 'LLM Prompts', 'Function Calling', 'RAG'],
        desc: 'Prompt engineering, model inference, structured outputs, and embeddings.'
      },
      {
        id: 'do',
        name: 'DevOps & Tooling',
        shortName: 'DevOps',
        level: devopsLvl,
        icon: Workflow,
        color: '#FFDE59',
        subskills: ['GitHub Actions', 'CI/CD', 'Docker', 'Vercel'],
        desc: 'Automated test runners, build pipelines, and production deployments.'
      },
      {
        id: 'al',
        name: 'Algorithmic Problem Solving',
        shortName: 'Algorithms',
        level: algoLvl,
        icon: Cpu,
        color: '#FF6B6B',
        subskills: ['Data Structures', 'Async Logic', 'Optimization'],
        desc: 'Complexity management, code clarity, and debugging endurance.'
      }
    ];
  }, [stats, repositories]);

  return (
    <div className="w-full flex flex-col space-y-5">
      {/* Skill Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillNodes.map((skill) => {
          const IconComponent = skill.icon;
          const isSelected = activeSkillId === skill.id;

          return (
            <div
              key={skill.id}
              onClick={() => setActiveSkillId(isSelected ? null : skill.id)}
              className={`neo-card p-4 flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'border-2 border-black bg-neutral-50 shadow-[6px_6px_0px_#000] -translate-y-1'
                  : 'hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]"
                      style={{ backgroundColor: skill.color }}
                    >
                      <IconComponent className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-neutral-900 leading-tight">
                        {skill.name}
                      </h4>
                      <span className="text-[11px] font-mono text-neutral-500 font-bold">
                        MASTERY TIER
                      </span>
                    </div>
                  </div>

                  <span className="neo-badge bg-black text-white text-[10px] py-0.5 px-2">
                    LVL {skill.level}/10
                  </span>
                </div>

                <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                  {skill.desc}
                </p>

                {/* Subskill tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {skill.subskills.map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-black/40 bg-white"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold font-mono mb-1">
                  <span className="text-neutral-500">EXPERIENCE</span>
                  <span>{skill.level * 10}%</span>
                </div>
                <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden border border-black">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level * 10}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
