'use server';

import { getGridById, getUserGrids } from '@/services/grid.service';
import { revalidatePath } from 'next/cache';

export async function getGridAction(gridId: string) {
  try {
    return await getGridById(gridId);
  } catch (error) {
    console.error('Error in getGridAction:', error);
    throw error;
  }
}

export async function getUserGridsAction() {
  try {
    return await getUserGrids();
  } catch (error) {
    console.error('Error in getUserGridsAction:', error);
    throw error;
  }
}

