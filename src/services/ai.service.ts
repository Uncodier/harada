import { generateText } from 'ai';
import { z } from 'zod';
import { AIGeneratedGrid } from '@/types/app.types';

const GridSchema = z.object({
  main_goal: z.string(),
  pillars: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      tasks: z.array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          tracking_type: z.enum(['boolean', 'numeric']),
          unit: z.string().optional(),
        })
      ),
    })
  ),
});

export async function generateHaradaGrid(mainGoal: string): Promise<AIGeneratedGrid> {
  const prompt = `You are an expert goal-setting coach using the Harada Method. 

The Harada Method is a Japanese goal-setting framework where:
1. A main goal is placed in the center
2. 8 critical supporting pillars are identified around the goal
3. Each pillar has 8 specific, actionable tasks (64 total tasks)

The user's main goal is: "${mainGoal}"

Generate a complete Harada Method grid with:
- 8 pillars that are essential for achieving this goal
- 8 actionable tasks for each pillar (64 total tasks)
- Each task should be specific, measurable, and daily-actionable
- Determine if each task should be tracked as 'boolean' (done/not done) or 'numeric' (with a measurable value)
- For numeric tasks, suggest an appropriate unit (e.g., 'km', 'kg', 'mins', 'reps', etc.)

Focus on:
- Tangible, concrete actions (not vague aspirations)
- Daily habits and routines
- Both technical skills and character development (like Ohtani's approach)
- Service to others and community contribution
- Mental toughness and personal growth

Return the structure as a JSON object with the main_goal and an array of 8 pillars, each containing 8 tasks.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just the raw JSON object.`;

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o',
      prompt,
    });

    // Parse the JSON response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    }

    // Parse and validate the JSON
    const parsed = JSON.parse(jsonText);
    const object = GridSchema.parse(parsed);

    // Validate that we have exactly 8 pillars with 8 tasks each
    if (object.pillars.length !== 8) {
      throw new Error('AI generated incorrect number of pillars');
    }

    for (const pillar of object.pillars) {
      if (pillar.tasks.length !== 8) {
        throw new Error(`Pillar "${pillar.name}" has incorrect number of tasks`);
      }
    }

    return object as AIGeneratedGrid;
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Add detailed error logging for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        hasApiKey: !!process.env.AI_GATEWAY_API_KEY,
        apiKeyPrefix: process.env.AI_GATEWAY_API_KEY?.substring(0, 7),
      });
    }
    
    throw new Error(
      `Failed to generate Harada grid: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

