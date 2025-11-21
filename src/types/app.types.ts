export interface GridWithRelations {
  id: string;
  main_goal: string;
  created_at: string;
  updated_at: string;
  pillars: PillarWithTasks[];
}

export interface PillarWithTasks {
  id: string;
  name: string;
  description: string | null;
  position: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  description: string | null;
  tracking_type: 'boolean' | 'numeric';
  unit: string | null;
  position: number;
}

export interface TaskWithLogs extends Task {
  logs: Log[];
}

export interface Log {
  id: string;
  value: number;
  notes: string | null;
  logged_at: string;
}

export interface AIGeneratedGrid {
  main_goal: string;
  pillars: Array<{
    name: string;
    description?: string;
    tasks: Array<{
      name: string;
      description?: string;
      tracking_type: 'boolean' | 'numeric';
      unit?: string;
    }>;
  }>;
}

