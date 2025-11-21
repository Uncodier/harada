import { createClient } from '@/lib/supabase/server';
import { TaskWithLogs } from '@/types/app.types';

export async function logTaskEntry(
  taskId: string,
  value: number,
  notes?: string,
  loggedAt?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from('logs').upsert(
    {
      task_id: taskId,
      value,
      notes: notes || null,
      logged_at: loggedAt || new Date().toISOString().split('T')[0],
    },
    {
      onConflict: 'task_id,logged_at',
    }
  );

  if (error) {
    throw new Error(`Failed to log entry: ${error.message}`);
  }
}

export async function getTaskWithLogs(taskId: string): Promise<TaskWithLogs | null> {
  const supabase = await createClient();

  // Get task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    return null;
  }

  // Get logs
  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select('*')
    .eq('task_id', taskId)
    .order('logged_at', { ascending: false });

  if (logsError) {
    throw new Error(`Failed to fetch logs: ${logsError.message}`);
  }

  return {
    ...task,
    logs: logs || [],
  };
}

export async function getTodayTasksForGrid(gridId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get all tasks for this grid
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      *,
      pillars!inner(grid_id),
      logs!left(value, logged_at)
    `)
    .eq('pillars.grid_id', gridId)
    .eq('logs.logged_at', today);

  if (tasksError) {
    throw new Error(`Failed to fetch today's tasks: ${tasksError.message}`);
  }

  return tasks || [];
}

export async function getTodayCompletedTaskIds(gridId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get all task IDs for this grid
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, pillars!inner(grid_id)')
    .eq('pillars.grid_id', gridId);

  if (tasksError || !tasks) {
    throw new Error(`Failed to fetch tasks: ${tasksError?.message}`);
  }

  const taskIds = tasks.map((t) => t.id);

  // Get today's completed logs for these tasks
  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select('task_id')
    .in('task_id', taskIds)
    .eq('logged_at', today)
    .gt('value', 0);

  if (logsError) {
    throw new Error(`Failed to fetch today's completions: ${logsError.message}`);
  }

  return new Set(logs?.map((log) => log.task_id) || []);
}

export async function getPillarProgress(pillarId: string, days: number = 30) {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Get all tasks for this pillar
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, tracking_type')
    .eq('pillar_id', pillarId);

  if (tasksError || !tasks) {
    throw new Error(`Failed to fetch tasks: ${tasksError?.message}`);
  }

  // Get logs for all tasks in this pillar
  const taskIds = tasks.map((t) => t.id);
  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select('task_id, value, logged_at')
    .in('task_id', taskIds)
    .gte('logged_at', startDateStr)
    .order('logged_at');

  if (logsError) {
    throw new Error(`Failed to fetch logs: ${logsError.message}`);
  }

  // Calculate average progress per day
  const dailyProgress: Record<string, number> = {};

  logs?.forEach((log) => {
    if (!dailyProgress[log.logged_at]) {
      dailyProgress[log.logged_at] = 0;
    }
    dailyProgress[log.logged_at] += log.value;
  });

  // Normalize by number of tasks
  const taskCount = tasks.length;
  const normalizedProgress = Object.entries(dailyProgress).map(([date, total]) => ({
    date,
    value: taskCount > 0 ? total / taskCount : 0,
  }));

  return normalizedProgress;
}

export async function getAllPillarsProgress(gridId: string, days: number = 30) {
  const supabase = await createClient();

  // Get all pillars for this grid
  const { data: pillars, error: pillarsError } = await supabase
    .from('pillars')
    .select('id, name')
    .eq('grid_id', gridId)
    .order('position');

  if (pillarsError || !pillars) {
    throw new Error(`Failed to fetch pillars: ${pillarsError?.message}`);
  }

  // Get progress for each pillar
  const progressData = await Promise.all(
    pillars.map(async (pillar) => {
      const progress = await getPillarProgress(pillar.id, days);
      const averageProgress =
        progress.length > 0
          ? progress.reduce((sum, p) => sum + p.value, 0) / progress.length
          : 0;

      return {
        pillar: pillar.name,
        progress: averageProgress,
      };
    })
  );

  return progressData;
}

export async function deleteLog(logId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('logs').delete().eq('id', logId);

  if (error) {
    throw new Error(`Failed to delete log: ${error.message}`);
  }
}
