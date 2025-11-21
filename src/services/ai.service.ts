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

interface RawAIGridResponse {
  main_goal?: string;
  pillars?: Array<{
    name?: string;
    description?: string;
    tasks?: Array<{
      name?: string;
      description?: string;
      tracking_type?: string;
      unit?: string;
    }>;
  }>;
}

/**
 * Normalizes tracking_type to valid enum values
 */
function normalizeTrackingType(value: string | undefined): 'boolean' | 'numeric' | null {
  if (!value) return null;
  
  const normalized = value.toLowerCase().trim();
  
  // Handle variations
  if (normalized === 'boolean' || normalized === 'bool' || normalized === 'true/false') {
    return 'boolean';
  }
  if (normalized === 'numeric' || normalized === 'num' || normalized === 'number') {
    return 'numeric';
  }
  
  return null;
}

/**
 * Sanitizes and validates AI response, ensuring 8 pillars with 8 tasks each
 */
function sanitizeAIGridResponse(raw: RawAIGridResponse): AIGeneratedGrid {
  const sanitized: AIGeneratedGrid = {
    main_goal: raw.main_goal || 'Untitled Goal',
    pillars: [],
  };

  // Process pillars
  const rawPillars = raw.pillars || [];
  
  for (let i = 0; i < 8; i++) {
    const rawPillar = rawPillars[i];
    
    if (!rawPillar || !rawPillar.name) {
      // Create placeholder pillar if missing
      sanitized.pillars.push({
        name: `Pillar ${i + 1}`,
        description: undefined,
        tasks: [],
      });
      continue;
    }

    const sanitizedPillar = {
      name: rawPillar.name.trim(),
      description: rawPillar.description?.trim(),
      tasks: [] as Array<{
        name: string;
        description?: string;
        tracking_type: 'boolean' | 'numeric';
        unit?: string;
      }>,
    };

    // Process tasks
    const rawTasks = rawPillar.tasks || [];
    
    for (const rawTask of rawTasks) {
      // Skip tasks with missing required fields
      if (!rawTask.name || !rawTask.tracking_type) {
        continue;
      }

      const normalizedTrackingType = normalizeTrackingType(rawTask.tracking_type);
      if (!normalizedTrackingType) {
        continue;
      }

      sanitizedPillar.tasks.push({
        name: rawTask.name.trim(),
        description: rawTask.description?.trim(),
        tracking_type: normalizedTrackingType,
        unit: rawTask.unit?.trim(),
      });
    }

    // Ensure exactly 8 tasks per pillar
    while (sanitizedPillar.tasks.length < 8) {
      sanitizedPillar.tasks.push({
        name: `Task ${sanitizedPillar.tasks.length + 1}`,
        tracking_type: 'boolean',
      });
    }

    // Trim to 8 if somehow we have more
    sanitizedPillar.tasks = sanitizedPillar.tasks.slice(0, 8);

    sanitized.pillars.push(sanitizedPillar);
  }

  // Ensure exactly 8 pillars
  while (sanitized.pillars.length < 8) {
    sanitized.pillars.push({
      name: `Pillar ${sanitized.pillars.length + 1}`,
      description: undefined,
      tasks: Array.from({ length: 8 }, (_, i) => ({
        name: `Task ${i + 1}`,
        tracking_type: 'boolean' as const,
      })),
    });
  }

  sanitized.pillars = sanitized.pillars.slice(0, 8);

  return sanitized;
}

export async function generateHaradaGrid(mainGoal: string, retryCount = 0): Promise<AIGeneratedGrid> {
  const maxRetries = 2;
  
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

CRITICAL REQUIREMENTS - EVERY TASK MUST HAVE:
- "name": A string describing the task (REQUIRED, cannot be empty or undefined)
- "tracking_type": Either exactly "boolean" OR exactly "numeric" (REQUIRED, must be one of these two values)
- "description": Optional string with more details
- "unit": Optional string for numeric tasks (e.g., "km", "kg", "mins")

Example of a valid task:
{
  "name": "Run 5 kilometers",
  "description": "Morning run for cardiovascular health",
  "tracking_type": "numeric",
  "unit": "km"
}

Example of another valid task:
{
  "name": "Complete daily meditation",
  "description": "10 minutes of mindfulness practice",
  "tracking_type": "boolean"
}

Focus on:
- Tangible, concrete actions (not vague aspirations)
- Daily habits and routines
- Both technical skills and character development (like Ohtani's approach)
- Service to others and community contribution
- Mental toughness and personal growth

Return the structure as a JSON object with the main_goal and an array of exactly 8 pillars, each containing exactly 8 tasks.

IMPORTANT: 
- Return ONLY valid JSON, no markdown, no code blocks, just the raw JSON object
- Every task MUST have a "name" field (string) and "tracking_type" field (either "boolean" or "numeric")
- Do not omit any required fields`;

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

    // Parse JSON
    let parsed: RawAIGridResponse;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw AI response:', jsonText);
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Sanitize the response before validation
    const sanitized = sanitizeAIGridResponse(parsed);
    console.log('Sanitized grid structure:', {
      pillarsCount: sanitized.pillars.length,
      tasksPerPillar: sanitized.pillars.map(p => p.tasks.length),
    });

    // Validate with Zod schema
    let validated: AIGeneratedGrid;
    try {
      validated = GridSchema.parse(sanitized) as AIGeneratedGrid;
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        console.error('Zod validation error:', {
          errors: zodError.errors,
          rawResponse: jsonText,
          parsedResponse: parsed,
          sanitizedResponse: sanitized,
        });
        
        // Build detailed error message
        const errorDetails = zodError.errors.map(err => {
          const path = err.path.join('.');
          return `  - ${path}: ${err.message}`;
        }).join('\n');
        
        throw new Error(`Validation failed:\n${errorDetails}`);
      }
      throw zodError;
    }

    // Final validation: ensure exactly 8 pillars with 8 tasks each
    if (validated.pillars.length !== 8) {
      throw new Error(`Expected 8 pillars, got ${validated.pillars.length}`);
    }

    for (let i = 0; i < validated.pillars.length; i++) {
      const pillar = validated.pillars[i];
      if (pillar.tasks.length !== 8) {
        throw new Error(`Pillar "${pillar.name}" (index ${i}) has ${pillar.tasks.length} tasks, expected 8`);
      }
    }

    return validated;
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        hasApiKey: !!process.env.AI_GATEWAY_API_KEY,
        apiKeyPrefix: process.env.AI_GATEWAY_API_KEY?.substring(0, 7),
        retryCount,
      });
    }

    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying AI generation (attempt ${retryCount + 1}/${maxRetries})...`);
      return generateHaradaGrid(mainGoal, retryCount + 1);
    }
    
    throw new Error(
      `Failed to generate Harada grid after ${maxRetries + 1} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

