'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FullGrid } from '@/components/grid/FullGrid';
import { LogEntryModal } from '@/components/tracking/LogEntryModal';
import { ProgressChart, RadarProgressChart } from '@/components/tracking/ProgressChart';
import { TodayTasksList } from '@/components/tracking/TodayTasksList';
import { getGridAction } from '@/app/actions/grid.actions';
import { getTaskWithLogsAction, logTaskEntryAction, getAllPillarsProgressAction, getTodayCompletedTaskIdsAction } from '@/app/actions/tracking.actions';
import { GridWithRelations, Task, TaskWithLogs } from '@/types/app.types';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function GridDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gridId = params.id as string;

  const [grid, setGrid] = useState<GridWithRelations | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskWithLogs, setTaskWithLogs] = useState<TaskWithLogs | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [radarData, setRadarData] = useState<Array<{ pillar: string; progress: number }>>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (gridId) {
      loadGrid();
    }
  }, [gridId]);

  const loadGrid = async () => {
    try {
      const gridData = await getGridAction(gridId);
      if (!gridData) {
        router.push('/dashboard');
        return;
      }
      setGrid(gridData);
      await loadRadarData();
      await loadTodayCompletions(gridData);
    } catch (error) {
      console.error('Error loading grid:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayCompletions = async (gridData: GridWithRelations) => {
    try {
      const completedIds = await getTodayCompletedTaskIdsAction(gridId);
      setCompletedTaskIds(new Set(completedIds));
    } catch (error) {
      console.error('Error loading today completions:', error);
    }
  };

  const loadRadarData = async () => {
    try {
      const data = await getAllPillarsProgressAction(gridId, 30);
      setRadarData(data);
    } catch (error) {
      console.error('Error loading radar data:', error);
    }
  };

  const handleTaskClick = async (taskId: string) => {
    try {
      const task = grid?.pillars
        .flatMap((p) => p.tasks)
        .find((t) => t.id === taskId);

      if (!task) return;

      setSelectedTask(task);
      const taskData = await getTaskWithLogsAction(taskId);
      setTaskWithLogs(taskData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  const handleLogSubmit = async (value: number, notes?: string, date?: string) => {
    if (!selectedTask) return;

    try {
      await logTaskEntryAction(selectedTask.id, value, notes, date);
      if (selectedTask) {
        const updatedTask = await getTaskWithLogsAction(selectedTask.id);
        setTaskWithLogs(updatedTask);
      }
      await loadGrid();
      await loadRadarData();
    } catch (error) {
      console.error('Error submitting log:', error);
      throw error;
    }
  };

  const getTodayTasks = (): Task[] => {
    if (!grid) return [];
    return grid.pillars.flatMap((p) => p.tasks);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading grid...</p>
        </div>
      </div>
    );
  }

  if (!grid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg text-gray-600 font-medium">Grid not found</p>
        </div>
      </div>
    );
  }

  const todayTasks = getTodayTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
              >
                <ArrowLeft size={18} />
                Back
              </Link>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {grid.main_goal}
              </h1>
            </div>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
            >
              <BarChart3 size={18} />
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {showAnalytics && (
          <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-6 overflow-y-auto h-screen animate-slide-in shadow-lg">
            <RadarProgressChart data={radarData} title="Pillar Progress (30 days)" />
            <div className="mt-8">
              <TodayTasksList
                tasks={todayTasks}
                completedTaskIds={completedTaskIds}
                onTaskClick={handleTaskClick}
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          <FullGrid grid={grid} onTaskClick={handleTaskClick} />
        </div>
      </div>

      {selectedTask && (
        <LogEntryModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
            setTaskWithLogs(null);
          }}
          onSubmit={handleLogSubmit}
          existingValue={
            taskWithLogs?.logs.find(
              (log) => log.logged_at === new Date().toISOString().split('T')[0]
            )?.value
          }
          existingNotes={
            taskWithLogs?.logs.find(
              (log) => log.logged_at === new Date().toISOString().split('T')[0]
            )?.notes || undefined
          }
          existingDate={new Date().toISOString().split('T')[0]}
        />
      )}
    </div>
  );
}

