from fastapi import APIRouter, Depends, HTTPException, Query
from backend.auth import get_current_user
from backend.models import Workout, WorkoutCreate, WorkoutUpdate
from backend.database import get_supabase_user_client
from typing import List, Optional
from datetime import date

router = APIRouter()

@router.get("/", response_model=List[Workout])
async def get_workouts(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's workouts with optional date filtering"""
    supabase = get_supabase_user_client(current_user["token"])
    
    query = supabase.table("workouts").select("*").eq("user_id", current_user["user"].id)
    
    if start_date:
        query = query.gte("scheduled_date", start_date.isoformat())
    if end_date:
        query = query.lte("scheduled_date", end_date.isoformat())
    
    result = query.order("scheduled_date").execute()
    
    return result.data

@router.post("/", response_model=Workout)
async def create_workout(workout: WorkoutCreate, current_user: dict = Depends(get_current_user)):
    """Create a new workout"""
    supabase = get_supabase_user_client(current_user["token"])
    
    workout_data = workout.model_dump()
    workout_data["user_id"] = str(current_user["user"].id)
    
    result = supabase.table("workouts").insert(workout_data).execute()
    
    return result.data[0]

@router.patch("/{workout_id}", response_model=Workout)
async def update_workout(
    workout_id: str,
    workout_update: WorkoutUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a workout"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("workouts").update(workout_update.model_dump(exclude_unset=True)).eq("id", workout_id).eq("user_id", current_user["user"].id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return result.data[0]

@router.delete("/{workout_id}")
async def delete_workout(workout_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a workout"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("workouts").delete().eq("id", workout_id).eq("user_id", current_user["user"].id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return {"message": "Workout deleted successfully"}
