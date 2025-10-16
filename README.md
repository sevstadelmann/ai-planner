# AI Planner App

A comprehensive AI-powered fitness and meal planning application with personalized daily schedules, workout generation, meal planning, and health tracking.

## Architecture

### Frontend (Next.js)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui component library
- **Authentication**: Supabase Auth with email/password
- **State Management**: React hooks + SWR for data fetching
- **Theme**: Dark mode support with custom color system

### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase
- **AI**: OpenAI GPT-4 for workout and meal generation
- **Authentication**: JWT tokens via Supabase
- **External Integrations**: Strava API for fitness tracking

## Features

### 1. Authentication & Onboarding
- Email/password authentication with Supabase
- Multi-step onboarding questionnaire
- User profile creation with goals and dietary preferences
- Activity level assessment

### 2. AI-Powered Workout Generation
- Personalized workout plans based on user goals
- Exercise recommendations with proper form instructions
- Weekly workout scheduling with recovery days
- Intensity and duration customization
- Detailed exercise breakdowns with sets, reps, and rest periods

### 3. AI-Powered Meal Planning
- Personalized meal generation based on nutritional needs
- Dietary restriction and allergy compliance
- Calorie and macro tracking
- Recipe instructions with prep and cook times
- Weekly meal plans with shopping lists
- Ingredient-based recipe suggestions

### 4. Smart Scheduler
- Automated daily schedule generation
- Weekly planning with balanced workouts and meals
- Conflict detection and optimization
- Calendar integration support

### 5. Health Tracking
- Sleep quality and duration tracking
- Weight progress monitoring
- Water intake logging
- Workout completion tracking
- Achievement system

### 6. Strava Integration
- OAuth authentication with Strava
- Automatic activity syncing
- Workout data import (distance, elevation, heart rate)
- Push workouts to Strava
- Athlete statistics dashboard

### 7. User Interface
- Mobile-first responsive design
- Dark mode with custom color palette
- Collapsible schedule entries
- Weekly calendar view
- Fitness progress dashboard with charts
- Profile management
- Settings with theme toggle

## Database Schema

### Core Tables
- **profiles**: User information (height, weight, age, activity level)
- **user_goals**: User fitness and health goals
- **dietary_preferences**: Dietary restrictions and preferences
- **workouts**: Scheduled and completed workouts
- **meals**: Meal plans with nutritional information
- **sleep_tracking**: Sleep quality and duration data
- **weight_tracking**: Weight progress over time
- **water_intake**: Daily water consumption
- **achievements**: User milestones and accomplishments
- **external_integrations**: OAuth tokens for third-party services

All tables implement Row Level Security (RLS) for data protection.

## API Endpoints

### Profile
- `GET /api/profile/me` - Get user profile
- `PUT /api/profile/me` - Update profile
- `GET /api/profile/goals` - Get user goals
- `POST /api/profile/goals` - Create goal

### Workouts
- `GET /api/workouts` - List workouts
- `POST /api/workouts` - Create workout
- `PATCH /api/workouts/{id}` - Update workout
- `DELETE /api/workouts/{id}` - Delete workout

### AI Workouts
- `POST /api/ai/workouts/generate` - Generate workout
- `POST /api/ai/workouts/generate-and-save` - Generate and save
- `POST /api/ai/workouts/weekly-plan` - Generate weekly plan
- `POST /api/ai/workouts/exercise-recommendations` - Get exercise suggestions

### Meals
- `GET /api/meals` - List meals
- `POST /api/meals` - Create meal
- `PATCH /api/meals/{id}` - Update meal
- `DELETE /api/meals/{id}` - Delete meal

### AI Meals
- `POST /api/ai/meals/generate` - Generate meal
- `POST /api/ai/meals/generate-and-save` - Generate and save
- `POST /api/ai/meals/daily-plan` - Generate daily meal plan
- `POST /api/ai/meals/weekly-plan` - Generate weekly meal plan
- `POST /api/ai/meals/recipe-suggestions` - Get recipe suggestions

### Scheduler
- `POST /api/scheduler/daily` - Generate daily schedule
- `POST /api/scheduler/weekly` - Generate weekly schedule
- `POST /api/scheduler/get` - Get schedule for date range
- `PATCH /api/scheduler/update` - Update schedule item
- `DELETE /api/scheduler/{type}/{id}` - Delete schedule item

### Health Tracking
- `POST /api/health/sleep` - Track sleep
- `GET /api/health/sleep` - Get sleep data
- `POST /api/health/weight` - Track weight
- `GET /api/health/weight` - Get weight data
- `POST /api/health/water` - Track water intake
- `GET /api/health/water` - Get water data

### Strava
- `POST /api/strava/connect` - Get authorization URL
- `POST /api/strava/callback` - Handle OAuth callback
- `GET /api/strava/stats` - Get athlete stats
- `GET /api/strava/activities` - Get recent activities
- `POST /api/strava/sync` - Sync activities to database
- `POST /api/strava/create-activity` - Push workout to Strava
- `DELETE /api/strava/disconnect` - Disconnect integration

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL (via Supabase)
- OpenAI API key
- Strava API credentials (optional)

### Frontend Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

### Backend Setup

1. Navigate to backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. Set up environment variables:
\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_api_key
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
\`\`\`

4. Run database migrations:
Execute the SQL scripts in the \`scripts\` folder in order.

5. Start the server:
\`\`\`bash
uvicorn backend.main:app --reload
\`\`\`

## Technology Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase Client
- Recharts (for data visualization)

### Backend
- FastAPI
- Python 3.9+
- Supabase (PostgreSQL)
- OpenAI API
- httpx (async HTTP client)
- Pydantic (data validation)

### Infrastructure
- Vercel (Frontend hosting)
- Supabase (Database & Auth)
- OpenAI (AI generation)
- Strava API (Fitness tracking)

## Key Design Decisions

1. **Separation of Concerns**: Frontend and backend are separate applications for scalability
2. **AI-First Approach**: GPT-4 generates personalized content based on user context
3. **Row Level Security**: All database queries are protected by RLS policies
4. **Mobile-First Design**: UI optimized for mobile with responsive breakpoints
5. **Real-time Sync**: Strava integration provides actual fitness data
6. **Modular Architecture**: Services are separated by domain (workouts, meals, health)

## Future Enhancements

- Google Calendar integration
- MyFitnessPal nutrition sync
- Voice assistant integration
- Social features (share workouts, meal plans)
- Wearable device integration (Apple Watch, Fitbit)
- Meal prep automation
- Grocery delivery integration
- Progress photos and body measurements
- Community challenges and leaderboards
- Nutrition barcode scanner

## License

MIT
