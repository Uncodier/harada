'use client';

import { GridWithRelations } from '@/types/app.types';
import { GoalCenter } from './GoalCenter';
import { PillarGroup } from './PillarGroup';

interface FullGridProps {
  grid: GridWithRelations;
  onTaskClick?: (taskId: string) => void;
  onGoalClick?: () => void;
}

export function FullGrid({ grid, onTaskClick, onGoalClick }: FullGridProps) {
  return (
    <div className="w-full h-screen overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 p-8">
      <div className="relative w-full h-full min-h-[800px] min-w-[1200px]">
        {/* SVG Container for the grid */}
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="-600 -600 1200 1200"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Center Goal */}
          <g transform="translate(0, 0)">
            <foreignObject x="-96" y="-96" width="192" height="192">
              <GoalCenter mainGoal={grid.main_goal} onClick={onGoalClick} />
            </foreignObject>
          </g>

          {/* 8 Pillar Groups */}
          {grid.pillars.map((pillar) => (
            <PillarGroup
              key={pillar.id}
              pillar={pillar}
              onTaskClick={onTaskClick}
              position={pillar.position}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

