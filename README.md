# Harada Method App

A goal-setting application based on the Harada Method, the system used by Shohei Ohtani to achieve his dreams. Transform your central goal into 8 pillars and 64 actionable daily tasks.

## Features

- **AI-Powered Grid Generation**: Enter your main goal and let AI generate 8 pillars and 64 tasks automatically
- **Visual Grid Layout**: Interactive 64-cell grid showing your goal structure
- **Dual Tracking Modes**: 
  - Boolean tracking (done/not done) for habits
  - Numeric tracking for measurable metrics
- **Progress Visualization**: 
  - Radar charts showing progress across all 8 pillars
  - Line charts for individual task metrics
- **Daily Routine Dashboard**: Track your daily tasks and see completion status

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Supabase** (Database & Authentication)
- **Vercel AI SDK** (OpenAI GPT-4)
- **Recharts** (Data visualization)
- **Tailwind CSS** (Styling)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `env.example` to `.env.local` and fill in your credentials:

```bash
cp env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (optional, for admin operations)
- `OPENAI_API_KEY`: Your OpenAI API key for AI generation
- `NEXT_PUBLIC_APP_URL`: Your app URL (default: http://localhost:3000)

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script in `supabase_schema.sql` in your Supabase SQL Editor
3. This will create all necessary tables with Row Level Security policies

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (auth)/              # Authentication routes
    dashboard/           # Protected app area
    api/                 # API routes
  components/            # React components
    grid/                # Grid visualization components
    tracking/            # Tracking & chart components
  services/              # Business logic & DB operations
  lib/                   # Utilities & clients
  types/                 # TypeScript definitions
```

## Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Create a Grid**: Enter your main goal (e.g., "Become a professional athlete")
3. **AI Generation**: The system generates 8 pillars and 64 tasks automatically
4. **Track Progress**: Click on any task to log your daily progress
5. **View Analytics**: Use the analytics panel to see your progress across pillars

## Database Schema

The app uses the following main tables:
- `profiles`: User profiles
- `grids`: Main goal containers
- `pillars`: 8 key areas per grid
- `tasks`: 64 actionable items (8 per pillar)
- `logs`: Daily tracking entries

See `supabase_schema.sql` for complete schema with RLS policies.

## License

MIT
