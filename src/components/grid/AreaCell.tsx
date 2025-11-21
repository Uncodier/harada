'use client';

import { PillarWithTasks } from '@/types/app.types';

interface AreaCellProps {
  pillar: PillarWithTasks;
  onClick?: () => void;
  className?: string;
}

// Color mapping for pillars based on position
const PILLAR_COLORS: Record<number, string> = {
  1: '#60A5FA', // light blue
  2: '#F97316', // orange-brown
  3: '#3B82F6', // blue
  4: '#991B1B', // dark red/maroon
  5: '#1E40AF', // dark blue
  6: '#1E3A8A', // navy blue
  7: '#9CA3AF', // light gray
  8: '#DC2626', // red
};

export function AreaCell({ pillar, onClick, className = '' }: AreaCellProps) {
  const color = PILLAR_COLORS[pillar.position] || '#9CA3AF';
  
  return (
    <div
      className={`
        w-full h-full rounded-lg
        flex items-center justify-center
        text-white font-bold text-sm
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
        ${className}
      `}
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      <div className="text-center px-2 py-1">
        <div className="text-xs sm:text-sm font-bold leading-tight">
          {pillar.name}
        </div>
      </div>
    </div>
  );
}

