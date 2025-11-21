'use client';

import { PillarWithTasks } from '@/types/app.types';
import { TaskCell } from './TaskCell';

interface PillarGroupProps {
  pillar: PillarWithTasks;
  onTaskClick?: (taskId: string) => void;
  position: number; // 1-8, determines placement around center
}

export function PillarGroup({ pillar, onTaskClick, position }: PillarGroupProps) {
  // Calculate position around the center (8 positions in a circle)
  const angle = ((position - 1) * 360) / 8;
  const radius = 280; // Distance from center
  const radian = (angle * Math.PI) / 180;

  // Position for the pillar center
  const pillarX = Math.cos(radian) * radius;
  const pillarY = Math.sin(radian) * radius;

  // Position tasks around the pillar (3x3 grid, pillar in center)
  const taskPositions = [
    { row: 0, col: 0 }, // Top-left
    { row: 0, col: 1 }, // Top-center
    { row: 0, col: 2 }, // Top-right
    { row: 1, col: 0 }, // Middle-left
    { row: 1, col: 2 }, // Middle-right (skip center for pillar)
    { row: 2, col: 0 }, // Bottom-left
    { row: 2, col: 1 }, // Bottom-center
    { row: 2, col: 2 }, // Bottom-right
  ];

  const taskSize = 100;
  const spacing = 10;

  return (
    <g transform={`translate(${pillarX}, ${pillarY})`}>
      {/* Pillar Center */}
      <g>
        <circle
          cx="0"
          cy="0"
          r="65"
          className="fill-gradient-to-br from-yellow-300 to-orange-300 stroke-yellow-500 stroke-3 opacity-90"
          style={{
            fill: 'url(#pillarGradient)',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
          }}
        />
        <defs>
          <linearGradient id="pillarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-bold fill-gray-900"
          style={{ fontSize: '13px', fontWeight: '700' }}
        >
          {pillar.name}
        </text>
      </g>

      {/* Tasks around pillar */}
      {pillar.tasks.map((task, index) => {
        const pos = taskPositions[index];
        const taskX = (pos.col - 1) * (taskSize + spacing);
        const taskY = (pos.row - 1) * (taskSize + spacing);

        return (
          <g key={task.id} transform={`translate(${taskX}, ${taskY})`}>
            <foreignObject width={taskSize} height={taskSize} x={-taskSize / 2} y={-taskSize / 2}>
              <TaskCell
                task={task}
                onClick={() => onTaskClick?.(task.id)}
                className="w-full h-full"
              />
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}

