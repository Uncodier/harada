'use client';

import { GridWithRelations } from '@/types/app.types';
import { AreaGrid } from './AreaGrid';
import { CentralGrid } from './CentralGrid';

interface FullGridProps {
  grid: GridWithRelations;
  onTaskClick?: (taskId: string) => void;
  onGoalClick?: () => void;
}

// Map 8 pillars to 9 positions in 3x3 grid
// Positions: row, col, pillar position
const OUTER_GRID_POSITIONS = [
  { row: 0, col: 0, pillarPosition: 1 }, // Top-left
  { row: 0, col: 1, pillarPosition: 2 }, // Top-center
  { row: 0, col: 2, pillarPosition: 3 }, // Top-right
  { row: 1, col: 0, pillarPosition: 4 }, // Middle-left
  { row: 1, col: 1, pillarPosition: 0 }, // Center: CentralGrid
  { row: 1, col: 2, pillarPosition: 5 }, // Middle-right
  { row: 2, col: 0, pillarPosition: 6 }, // Bottom-left
  { row: 2, col: 1, pillarPosition: 7 }, // Bottom-center
  { row: 2, col: 2, pillarPosition: 8 }, // Bottom-right
];

export function FullGrid({ grid, onTaskClick, onGoalClick }: FullGridProps) {
  // Create a map of pillar position to pillar
  const pillarMap = new Map(
    grid.pillars.map((pillar) => [pillar.position, pillar])
  );

  // Create grid items in row-major order (left to right, top to bottom)
  const gridItems: Array<{ type: 'central' | 'area' | 'empty'; pillarPosition?: number; row: number; col: number }> = [];
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const pos = OUTER_GRID_POSITIONS.find(p => p.row === row && p.col === col);
      if (pos) {
        if (pos.pillarPosition === 0) {
          gridItems.push({ type: 'central', row, col });
        } else {
          const pillar = pillarMap.get(pos.pillarPosition);
          if (pillar) {
            gridItems.push({ type: 'area', pillarPosition: pos.pillarPosition, row, col });
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
    <div className="w-full h-screen overflow-auto bg-black p-4">
      <div className="max-w-[1800px] mx-auto h-full flex items-center justify-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full max-h-[1600px] aspect-square">
          {gridItems.map((item, index) => {
            if (item.type === 'central') {
              return (
                <div
                  key="central-grid"
                  className="w-full h-full"
                >
                  <CentralGrid
                    grid={grid}
                    onGoalClick={onGoalClick}
                  />
                </div>
              );
            }

            if (item.type === 'area' && item.pillarPosition !== undefined) {
              const pillar = pillarMap.get(item.pillarPosition);
              if (!pillar) return null;
              
              return (
                <div
                  key={pillar.id}
                  className="w-full h-full"
                >
                  <AreaGrid
                    pillar={pillar}
                    onTaskClick={onTaskClick}
                  />
                </div>
              );
            }

            // Empty cell
            return (
              <div
                key={`empty-${item.row}-${item.col}`}
                className="bg-gray-900 rounded border border-gray-800"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

