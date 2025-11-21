'use client';

import { GridWithRelations } from '@/types/app.types';
import { AreaCell } from './AreaCell';
import { GoalCenter } from './GoalCenter';

interface CentralGridProps {
  grid: GridWithRelations;
  onPillarClick?: (pillarId: string) => void;
  onGoalClick?: () => void;
}

// Map 8 pillars to 9 positions in 3x3 grid
// Positions: row, col, pillar position
const CENTRAL_GRID_POSITIONS = [
  { row: 0, col: 0, pillarPosition: 1 }, // Top-left: AREA 1
  { row: 0, col: 1, pillarPosition: 2 }, // Top-center: AREA 2
  { row: 0, col: 2, pillarPosition: 3 }, // Top-right: AREA 3
  { row: 1, col: 0, pillarPosition: 4 }, // Middle-left: AREA 4
  { row: 1, col: 1, pillarPosition: 0 }, // Center: MAIN GOAL
  { row: 1, col: 2, pillarPosition: 5 }, // Middle-right: AREA 5 (mapped to position 5)
  { row: 2, col: 0, pillarPosition: 6 }, // Bottom-left: AREA 6 (mapped to position 6)
  { row: 2, col: 1, pillarPosition: 7 }, // Bottom-center: AREA 7 (mapped to position 7)
  { row: 2, col: 2, pillarPosition: 8 }, // Bottom-right: AREA 8 (mapped to position 8)
];

export function CentralGrid({ grid, onPillarClick, onGoalClick }: CentralGridProps) {
  // Create a map of pillar position to pillar
  const pillarMap = new Map(
    grid.pillars.map((pillar) => [pillar.position, pillar])
  );

  // Create grid items in row-major order (left to right, top to bottom)
  const gridItems: Array<{ type: 'goal' | 'pillar' | 'empty'; pillarPosition?: number; row: number; col: number }> = [];
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const pos = CENTRAL_GRID_POSITIONS.find(p => p.row === row && p.col === col);
      if (pos) {
        if (pos.pillarPosition === 0) {
          gridItems.push({ type: 'goal', row, col });
        } else {
          const pillar = pillarMap.get(pos.pillarPosition);
          if (pillar) {
            gridItems.push({ type: 'pillar', pillarPosition: pos.pillarPosition, row, col });
          } else {
            gridItems.push({ type: 'empty', row, col });
          }
        }
      } else {
        gridItems.push({ type: 'empty', row, col });
      }
    }
  }

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full aspect-square">
      {gridItems.map((item, index) => {
        if (item.type === 'goal') {
          return (
            <div
              key="main-goal"
              className="bg-gray-800/50 rounded border border-gray-700/50 p-1 relative"
            >
              <GoalCenter mainGoal={grid.main_goal} onClick={onGoalClick} />
            </div>
          );
        }

        if (item.type === 'pillar' && item.pillarPosition !== undefined) {
          const pillar = pillarMap.get(item.pillarPosition);
          if (!pillar) return null;
          
          return (
            <div
              key={pillar.id}
              className="bg-gray-800/50 rounded border border-gray-700/50 p-1"
            >
              <AreaCell
                pillar={pillar}
                onClick={() => onPillarClick?.(pillar.id)}
                className="w-full h-full"
              />
            </div>
          );
        }

        // Empty cell
        return (
          <div
            key={`empty-${item.row}-${item.col}`}
            className="bg-gray-800/50 rounded border border-gray-700/50"
          />
        );
      })}
    </div>
  );
}

