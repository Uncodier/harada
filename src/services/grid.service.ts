import { createClient } from '@/lib/supabase/server';
import { GridWithRelations, AIGeneratedGrid } from '@/types/app.types';
import { Database } from '@/types/database.types';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function createGridFromAI(data: AIGeneratedGrid) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Ensure profile exists (in case trigger didn't fire)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existingProfile) {
    // Create profile if it doesn't exist
    const profileInsert: Database['public']['Tables']['profiles']['Insert'] = {
      id: user.id,
      email: user.email || null,
      full_name: user.user_metadata?.full_name || null,
    };
    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileInsert as any);

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }
  }

  // Create the grid
  const gridInsert: Database['public']['Tables']['grids']['Insert'] = {
    user_id: user.id,
    main_goal: data.main_goal,
  };
  const { data: grid, error: gridError } = await supabase
    .from('grids')
    .insert(gridInsert as any)
    .select()
    .single();

  if (gridError || !grid) {
    throw new Error(`Failed to create grid: ${gridError?.message}`);
  }

  // Create pillars and tasks
  for (const pillarData of data.pillars) {
    const pillarInsert: Database['public']['Tables']['pillars']['Insert'] = {
      grid_id: (grid as any).id,
      name: pillarData.name,
      description: pillarData.description || null,
      position: data.pillars.indexOf(pillarData) + 1,
    };
    const { data: pillar, error: pillarError } = await supabase
      .from('pillars')
      .insert(pillarInsert as any)
      .select()
      .single();

    if (pillarError || !pillar) {
      throw new Error(`Failed to create pillar: ${pillarError?.message}`);
    }

    // Create tasks for this pillar
    for (const taskData of pillarData.tasks) {
      const taskInsert: Database['public']['Tables']['tasks']['Insert'] = {
        pillar_id: (pillar as any).id,
        name: taskData.name,
        description: taskData.description || null,
        tracking_type: taskData.tracking_type,
        unit: taskData.unit || null,
        position: pillarData.tasks.indexOf(taskData) + 1,
      };
      const { error: taskError } = await supabase
        .from('tasks')
        .insert(taskInsert as any);

      if (taskError) {
        throw new Error(`Failed to create task: ${taskError.message}`);
      }
    }
  }

  return (grid as any).id;
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
        .eq('pillar_id', (pillar as any).id)
        .order('position');

      if (tasksError) {
        throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
      }

      return {
        ...(pillar as any),
        tasks: (tasks || []) as any[],
      };
    })
  );

  return {
    ...(grid as any),
    pillars: pillarsWithTasks,
  } as GridWithRelations;
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

  const updateData: Database['public']['Tables']['grids']['Update'] = {
    main_goal: mainGoal,
  };
  const { error } = await supabase
    .from('grids')
    // @ts-expect-error - Supabase type inference issue with Database generic
    .update(updateData as any)
    .eq('id', gridId);

  if (error) {
    throw new Error(`Failed to update grid: ${error.message}`);
  }
}

export async function updatePillar(pillarId: string, name: string, description?: string) {
  const supabase = await createClient();

  const updateData: Database['public']['Tables']['pillars']['Update'] = {
    name,
    description: description || null,
  };
  const { error } = await supabase
    .from('pillars')
    // @ts-expect-error - Supabase type inference issue with Database generic
    .update(updateData as any)
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

  const updateData: Database['public']['Tables']['tasks']['Update'] = {
    name,
    description: description || null,
    ...(trackingType && { tracking_type: trackingType }),
    ...(unit !== undefined && { unit }),
  };

  const { error } = await supabase
    .from('tasks')
    // @ts-expect-error - Supabase type inference issue with Database generic
    .update(updateData as any)
    .eq('id', taskId);

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
}

