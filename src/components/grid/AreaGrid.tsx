'use client';

import { PillarWithTasks } from '@/types/app.types';
import { TaskCell } from './TaskCell';
import { AreaCell } from './AreaCell';

interface AreaGridProps {
  pillar: PillarWithTasks;
  onTaskClick?: (taskId: string) => void;
  onPillarClick?: () => void;
}

// Task positions in 3x3 grid (excluding center where pillar goes)
// Positions: row, col
const TASK_POSITIONS = [
  { row: 0, col: 0 }, // Top-left
  { row: 0, col: 1 }, // Top-center
  { row: 0, col: 2 }, // Top-right
  { row: 1, col: 0 }, // Middle-left
  { row: 1, col: 2 }, // Middle-right (skip center for pillar)
  { row: 2, col: 0 }, // Bottom-left
  { row: 2, col: 1 }, // Bottom-center
  { row: 2, col: 2 }, // Bottom-right
];

export function AreaGrid({ pillar, onTaskClick, onPillarClick }: AreaGridProps) {
  // Create a 3x3 grid structure with tasks and pillar
  const gridItems: Array<{ type: 'task' | 'pillar' | 'empty'; taskIndex?: number; row: number; col: number }> = [];
  
  // Fill the 3x3 grid
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 1 && col === 1) {
        // Center position - pillar
        gridItems.push({ type: 'pillar', row, col });
      } else {
        // Find task for this position
        const taskIndex = TASK_POSITIONS.findIndex(p => p.row === row && p.col === col);
        if (taskIndex >= 0 && taskIndex < pillar.tasks.length) {
          gridItems.push({ type: 'task', taskIndex, row, col });
        } else {
          gridItems.push({ type: 'empty', row, col });
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full aspect-square">
      {gridItems.map((item, index) => {
        if (item.type === 'pillar') {
          return (
            <div
              key="pillar"
              className="bg-gray-800/50 rounded border border-gray-700/50 p-1"
            >
              <AreaCell
                pillar={pillar}
                onClick={onPillarClick}
                className="w-full h-full"
              />
            </div>
          );
        }
        
        if (item.type === 'task' && item.taskIndex !== undefined) {
          const task = pillar.tasks[item.taskIndex];
          return (
            <div
              key={task.id}
              className="bg-gray-800/50 rounded border border-gray-700/50 p-1"
            >
              <TaskCell
                task={task}
                onClick={() => onTaskClick?.(task.id)}
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

