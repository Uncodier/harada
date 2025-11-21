'use client';

import { Task } from '@/types/app.types';
import { useState } from 'react';

interface TaskCellProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

export function TaskCell({ task, onClick, className = '' }: TaskCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer
        bg-white text-gray-900 overflow-hidden
        ${task.tracking_type === 'boolean' 
          ? 'border-blue-400 hover:border-blue-500 hover:bg-blue-50' 
          : 'border-green-400 hover:border-green-500 hover:bg-green-50'}
        ${isHovered ? 'scale-105 shadow-xl -translate-y-1' : 'hover:shadow-lg hover:-translate-y-0.5'}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10 overflow-hidden">
        <div className="text-xs font-bold text-gray-900 mb-1.5 leading-tight break-words">{task.name}</div>
        {task.description && (
          <div className="text-xs text-gray-700 line-clamp-2 leading-relaxed mb-2 break-words">{task.description}</div>
        )}
        {task.unit && (
          <div className="mt-2">
            <span className="text-xs text-gray-600 font-medium relative z-10 break-words">{task.unit}</span>
          </div>
        )}
      </div>
      {isHovered && (
        <div className={`absolute inset-0 rounded-xl pointer-events-none z-0 ${task.tracking_type === 'boolean' ? 'bg-gradient-to-br from-blue-500/10 to-transparent' : 'bg-gradient-to-br from-green-500/10 to-transparent'}`}></div>
      )}
    </div>
  );
}

