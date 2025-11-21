import { NextRequest, NextResponse } from 'next/server';
import { generateHaradaGrid } from '@/services/ai.service';
import { createGridFromAI } from '@/services/grid.service';

export async function POST(request: NextRequest) {
  try {
    const { mainGoal } = await request.json();

    if (!mainGoal || typeof mainGoal !== 'string' || mainGoal.trim().length === 0) {
      return NextResponse.json({ error: 'Main goal is required' }, { status: 400 });
    }

    // Generate the grid structure using AI
    const generatedGrid = await generateHaradaGrid(mainGoal.trim());

    // Save to database
    const gridId = await createGridFromAI(generatedGrid);

    return NextResponse.json({ success: true, gridId, grid: generatedGrid });
  } catch (error) {
    console.error('Error generating grid:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate grid',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

