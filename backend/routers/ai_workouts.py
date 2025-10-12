from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.services.ai_workout_generator import generate_workout, generate_weekly_workout_plan, get_exercise_recommendations
from backend.database import get_supabase_user_client
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, timedelta

router = APIRouter()

class WorkoutGenerationRequest(BaseModel):
    workout_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    intensity: Optional[str] = None
    focus_areas: Optional[List[str]] = None
    equipment: Optional[List[str]] = None

class WeeklyPlanRequest(BaseModel):
    days_per_week: int = 4
    start_date: date

class ExerciseRecommendationRequest(BaseModel):
    muscle_group: Optional[str] = None
    equipment: Optional[str] = None

@router.post("/generate")
async def create_ai_workout(
    request: WorkoutGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a personalized workout using AI
    """
    try:
        preferences = request.model_dump(exclude_unset=True)
        workout_data = await generate_workout(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            preferences=preferences
        )
        
        return {
            "success": True,
            "workout": workout_data,
            "message": "Workout generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate workout: {str(e)}")

@router.post("/generate-and-save")
async def generate_and_save_workout(
    request: WorkoutGenerationRequest,
    scheduled_date: date,
    scheduled_time: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a workout and save it to the user's schedule
    """
    try:
        preferences = request.model_dump(exclude_unset=True)
        workout_data = await generate_workout(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            preferences=preferences
        )
        
        # Save to database
        supabase = get_supabase_user_client(current_user["token"])
        
        workout_record = {
            "user_id": str(current_user["user"].id),
            "title": workout_data["title"],
            "description": workout_data["description"],
            "workout_type": workout_data["workout_type"],
            "duration_minutes": workout_data["duration_minutes"],
            "calories_burned": workout_data.get("calories_burned"),
            "intensity": workout_data["intensity"],
            "scheduled_date": scheduled_date.isoformat(),
            "scheduled_time": scheduled_time,
            "notes": f"Exercises:\n{chr(10).join([f'- {ex['name']}: {ex.get('sets', '')}x{ex.get('reps', '')}' for ex in workout_data.get('exercises', [])])}\n\nWarmup: {workout_data.get('warmup', '')}\n\nCooldown: {workout_data.get('cooldown', '')}\n\n{workout_data.get('notes', '')}"
        }
        
        result = supabase.table("workouts").insert(workout_record).execute()
        
        return {
            "success": True,
            "workout": result.data[0],
            "ai_details": workout_data,
            "message": "Workout generated and saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate and save workout: {str(e)}")

@router.post("/weekly-plan")
async def create_weekly_plan(
    request: WeeklyPlanRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a complete weekly workout plan
    """
    try:
        plan = await generate_weekly_workout_plan(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            days_per_week=request.days_per_week
        )
        
        # Save workouts to database
        supabase = get_supabase_user_client(current_user["token"])
        
        saved_workouts = []
        for day_plan in plan:
            if day_plan["workout_type"] != "rest":
                workout_date = request.start_date + timedelta(days=day_plan["day"] - 1)
                
                workout_record = {
                    "user_id": str(current_user["user"].id),
                    "title": day_plan["title"],
                    "description": day_plan["description"],
                    "workout_type": day_plan["workout_type"],
                    "duration_minutes": day_plan["duration_minutes"],
                    "intensity": day_plan["intensity"],
                    "scheduled_date": workout_date.isoformat(),
                    "notes": f"Focus: {day_plan.get('focus', '')}"
                }
                
                result = supabase.table("workouts").insert(workout_record).execute()
                saved_workouts.append(result.data[0])
        
        return {
            "success": True,
            "plan": plan,
            "saved_workouts": saved_workouts,
            "message": f"Weekly plan generated with {len(saved_workouts)} workouts"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate weekly plan: {str(e)}")

@router.post("/exercise-recommendations")
async def get_recommendations(
    request: ExerciseRecommendationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Get exercise recommendations based on criteria
    """
    try:
        exercises = await get_exercise_recommendations(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            muscle_group=request.muscle_group,
            equipment=request.equipment
        )
        
        return {
            "success": True,
            "exercises": exercises,
            "message": "Exercise recommendations generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")
