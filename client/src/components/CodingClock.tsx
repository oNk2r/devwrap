import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CodingClockProps {
  username: string;
}

export default function CodingClock({ username }: CodingClockProps) {
  // Compute deterministic activity distribution based on username
  const clockData = useMemo(() => {
    const charCodeSum = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mode = charCodeSum % 3; // 0 = Night Owl, 1 = Midday Maker, 2 = Early Bird

    let title = 'Night Owl';
    let subtitle = 'Peak coding: 11PM – 2AM';
    let icon = '🌙';
    let peakHours = [22, 23, 0, 1, 2];
    let peakCenter = 0; // midnight

    if (mode === 1) {
      title = 'Midday Maker';
      subtitle = 'Peak coding: 1PM – 4PM';
      icon = '☀️';
      peakHours = [12, 13, 14, 15, 16];
      peakCenter = 14;
    } else if (mode === 2) {
      title = 'Early Bird';
      subtitle = 'Peak coding: 7AM – 10AM';
      icon = '🌅';
      peakHours = [7, 8, 9, 10, 11];
      peakCenter = 9;
    }

    // Generate normal-like distribution around the peak center
    const hours = Array.from({ length: 24 }).map((_, h) => {
      // Calculate circular distance
      let diff = Math.abs(h - peakCenter);
      if (diff > 12) diff = 24 - diff;

      // Amplitude/Gaussian value
      const stdDev = 3.5;
      const val = Math.exp(-0.5 * Math.pow(diff / stdDev, 2));

      // Add small base noise
      const noise = Math.abs(Math.sin(h * 0.78 + charCodeSum)) * 0.15;
      const rawVal = Math.min(100, Math.round((val + noise) * 100));

      const isPeak = peakHours.includes(h);

      return {
        hour: h,
        value: rawVal,
        isPeak,
        label: h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`
      };
    });

    return { title, subtitle, icon, hours };
  }, [username]);

  const width = 250;
  const height = 250;
  const cx = width / 2;
  const cy = height / 2;
  const innerR = 40;
  const outerR = 86;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full p-2 relative select-none">
      
      {/* Visual Polar Clock Section */}
      <div className="relative flex-1 flex items-center justify-center w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[210px] overflow-visible">
          {/* Subtle Outer Dial Ring */}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#141416" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#141416" strokeWidth={1} />
          
          {/* Major Hour Markers (12, 3, 6, 9) */}
          {[0, 6, 12, 18].map((h) => {
            const angle = (h * 2 * Math.PI) / 24 - Math.PI / 2;
            const x1 = cx + (innerR - 6) * Math.cos(angle);
            const y1 = cy + (innerR - 6) * Math.sin(angle);
            const x2 = cx + (innerR - 1) * Math.cos(angle);
            const y2 = cy + (innerR - 1) * Math.sin(angle);
            return (
              <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3f3f46" strokeWidth={1.5} />
            );
          })}

          {/* Activity Radial Bars */}
          {clockData.hours.map((item) => {
            const angle = (item.hour * 2 * Math.PI) / 24 - Math.PI / 2;
            
            // Length of the bar based on the value
            const length = innerR + (item.value / 100) * (outerR - innerR);
            const x1 = cx + innerR * Math.cos(angle);
            const y1 = cy + innerR * Math.sin(angle);
            const x2 = cx + length * Math.cos(angle);
            const y2 = cy + length * Math.sin(angle);

            // Tip coordinates for a dot
            const tx = cx + (length + 2) * Math.cos(angle);
            const ty = cy + (length + 2) * Math.sin(angle);

            // Styling colors
            const strokeColor = item.isPeak ? '#9FE870' : '#1f1f23';
            const strokeWidth = item.isPeak ? 3 : 2;

            return (
              <g key={item.hour} className="group cursor-help">
                <title>{`${item.label}: ${item.value}% Activity`}</title>
                
                {/* Background line for layout consistency */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={cx + outerR * Math.cos(angle)}
                  y2={cy + outerR * Math.sin(angle)}
                  stroke="#0b0b0c"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />

                {/* Actual activity line */}
                <motion.line
                  initial={{ x2: x1, y2: y1 }}
                  animate={{ x2, y2 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: item.hour * 0.02 }}
                  x1={x1}
                  y1={y1}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />

                {/* Peak Tip Dot */}
                {item.isPeak && item.value > 20 && (
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + item.hour * 0.02, type: 'spring' }}
                    cx={tx}
                    cy={ty}
                    r={2}
                    fill="#9FE870"
                  />
                )}
              </g>
            );
          })}

          {/* Central content overlay */}
          <foreignObject
            x={cx - innerR + 5}
            y={cy - innerR + 5}
            width={(innerR - 5) * 2}
            height={(innerR - 5) * 2}
          >
            <div className="w-full h-full flex flex-col items-center justify-center text-center select-none leading-none">
              <span className="text-lg mb-1">{clockData.icon}</span>
              <span className="text-[9px] font-sans font-bold text-white uppercase tracking-wider">
                {clockData.title.split(' ')[0]}
              </span>
              <span className="text-[8px] font-sans text-neutral-500 tracking-tight mt-0.5">
                {clockData.title.split(' ')[1] || 'DEV'}
              </span>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Narrative block at the bottom */}
      <div className="text-center mt-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{clockData.title}</h3>
        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{clockData.subtitle}</p>
      </div>
    </div>
  );
}
