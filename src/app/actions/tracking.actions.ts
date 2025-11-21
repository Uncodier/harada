'use server';

import { getTaskWithLogs, logTaskEntry, getAllPillarsProgress, getTodayCompletedTaskIds } from '@/services/tracking.service';
import { revalidatePath } from 'next/cache';

export async function getTaskWithLogsAction(taskId: string) {
  try {
    return await getTaskWithLogs(taskId);
  } catch (error) {
    console.error('Error in getTaskWithLogsAction:', error);
    throw error;
  }
}

export async function logTaskEntryAction(
  taskId: string,
  value: number,
  notes?: string,
  date?: string
) {
  try {
    await logTaskEntry(taskId, value, notes, date);
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error in logTaskEntryAction:', error);
    throw error;
  }
}

export async function getAllPillarsProgressAction(gridId: string, days: number = 30) {
  try {
    return await getAllPillarsProgress(gridId, days);
  } catch (error) {
    console.error('Error in getAllPillarsProgressAction:', error);
    throw error;
  }
}

export async function getTodayCompletedTaskIdsAction(gridId: string) {
  try {
    const ids = await getTodayCompletedTaskIds(gridId);
    return Array.from(ids);
  } catch (error) {
    console.error('Error in getTodayCompletedTaskIdsAction:', error);
    throw error;
  }
}
