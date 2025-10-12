from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import workouts, meals, health, profile, integrations, ai_workouts, ai_meals, scheduler, strava
from backend.config import settings

app = FastAPI(
    title="AI Planner API",
    description="Backend API for AI-powered fitness and meal planning",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(workouts.router, prefix="/api/workouts", tags=["workouts"])
app.include_router(ai_workouts.router, prefix="/api/ai/workouts", tags=["ai-workouts"])
app.include_router(meals.router, prefix="/api/meals", tags=["meals"])
app.include_router(ai_meals.router, prefix="/api/ai/meals", tags=["ai-meals"])
app.include_router(scheduler.router, prefix="/api/scheduler", tags=["scheduler"])
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])
app.include_router(strava.router, prefix="/api/strava", tags=["strava"])

@app.get("/")
async def root():
    return {"message": "AI Planner API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
