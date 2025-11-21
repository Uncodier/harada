import { createClient } from '@/lib/supabase/server';
import { GridWithRelations, AIGeneratedGrid } from '@/types/app.types';

export async function createGridFromAI(data: AIGeneratedGrid) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Create the grid
  const { data: grid, error: gridError } = await supabase
    .from('grids')
    .insert({
      user_id: user.id,
      main_goal: data.main_goal,
    })
    .select()
    .single();

  if (gridError || !grid) {
    throw new Error(`Failed to create grid: ${gridError?.message}`);
  }

  // Create pillars and tasks
  for (const pillarData of data.pillars) {
    const { data: pillar, error: pillarError } = await supabase
      .from('pillars')
      .insert({
        grid_id: grid.id,
        name: pillarData.name,
        description: pillarData.description || null,
        position: data.pillars.indexOf(pillarData) + 1,
      })
      .select()
      .single();

    if (pillarError || !pillar) {
      throw new Error(`Failed to create pillar: ${pillarError?.message}`);
    }

    // Create tasks for this pillar
    for (const taskData of pillarData.tasks) {
      const { error: taskError } = await supabase.from('tasks').insert({
        pillar_id: pillar.id,
        name: taskData.name,
        description: taskData.description || null,
        tracking_type: taskData.tracking_type,
        unit: taskData.unit || null,
        position: pillarData.tasks.indexOf(taskData) + 1,
      });

      if (taskError) {
        throw new Error(`Failed to create task: ${taskError.message}`);
      }
    }
  }

  return grid.id;
}

export async function getGridById(gridId: string): Promise<GridWithRelations | null> {
  const supabase = await createClient();

  // Get grid
  const { data: grid, error: gridError } = await supabase
    .from('grids')
    .select('*')
    .eq('id', gridId)
    .single();

  if (gridError || !grid) {
    return null;
  }

  // Get pillars
  const { data: pillars, error: pillarsError } = await supabase
    .from('pillars')
    .select('*')
    .eq('grid_id', gridId)
    .order('position');

  if (pillarsError) {
    throw new Error(`Failed to fetch pillars: ${pillarsError.message}`);
  }

  // Get tasks for each pillar
  const pillarsWithTasks = await Promise.all(
    (pillars || []).map(async (pillar) => {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('pillar_id', pillar.id)
        .order('position');

      if (tasksError) {
        throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
      }

      return {
        ...pillar,
        tasks: tasks || [],
      };
    })
  );

  return {
    ...grid,
    pillars: pillarsWithTasks,
  };
}

export async function getUserGrids() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: grids, error } = await supabase
    .from('grids')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch grids: ${error.message}`);
  }

  return grids || [];
}

export async function updateGridGoal(gridId: string, mainGoal: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('grids')
    .update({ main_goal: mainGoal })
    .eq('id', gridId);

  if (error) {
    throw new Error(`Failed to update grid: ${error.message}`);
  }
}

export async function updatePillar(pillarId: string, name: string, description?: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('pillars')
    .update({
      name,
      description: description || null,
    })
    .eq('id', pillarId);

  if (error) {
    throw new Error(`Failed to update pillar: ${error.message}`);
  }
}

export async function updateTask(
  taskId: string,
  name: string,
  description?: string,
  trackingType?: 'boolean' | 'numeric',
  unit?: string
) {
  const supabase = await createClient();

  const updateData: any = {
    name,
    description: description || null,
  };

  if (trackingType) {
    updateData.tracking_type = trackingType;
  }

  if (unit !== undefined) {
    updateData.unit = unit;
  }

  const { error } = await supabase.from('tasks').update(updateData).eq('id', taskId);

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
}

