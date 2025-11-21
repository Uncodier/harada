'use client';

import { Task } from '@/types/app.types';
import { CheckCircle2, Circle } from 'lucide-react';

interface TodayTasksListProps {
  tasks: Task[];
  completedTaskIds?: Set<string>;
  onTaskClick: (taskId: string) => void;
}

export function TodayTasksList({ tasks, completedTaskIds = new Set(), onTaskClick }: TodayTasksListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-gray-900 mb-5">Today's Routine</h3>
      {tasks.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
          <p className="text-gray-500 font-medium">No tasks for today.</p>
          <p className="text-sm text-gray-400 mt-1">Create a grid to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = completedTaskIds.has(task.id);
            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task.id)}
                className={`
                  p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                  ${isCompleted 
                    ? 'bg-green-50/80 border-green-300 hover:border-green-400 hover:shadow-md' 
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg'}
                  transform hover:-translate-y-0.5
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="text-green-600" size={22} />
                    ) : (
                      <Circle className="text-gray-400 group-hover:text-purple-500 transition-colors" size={22} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {task.name}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-600 mt-1.5 line-clamp-2">{task.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span
                        className={`
                          text-xs px-2.5 py-1 rounded-lg font-semibold
                          ${task.tracking_type === 'boolean' 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                            : 'bg-green-100 text-green-700 border border-green-200'}
                        `}
                      >
                        {task.tracking_type === 'boolean' ? 'Habit' : 'Metric'}
                      </span>
                      {task.unit && (
                        <span className="text-xs text-gray-500 font-medium">{task.unit}</span>
                      )}
                    </div>
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

