from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.models import Profile, ProfileUpdate, UserGoalCreate, UserGoal
from backend.database import get_supabase_user_client
from typing import List

router = APIRouter()

@router.get("/me", response_model=Profile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("profiles").select("*").eq("id", current_user["user"].id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return result.data

@router.put("/me", response_model=Profile)
async def update_profile(profile_update: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user's profile"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("profiles").update(profile_update.model_dump(exclude_unset=True)).eq("id", current_user["user"].id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return result.data[0]

@router.get("/goals", response_model=List[UserGoal])
async def get_goals(current_user: dict = Depends(get_current_user)):
    """Get user's goals"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("user_goals").select("*").eq("user_id", current_user["user"].id).execute()
    
    return result.data

@router.post("/goals", response_model=UserGoal)
async def create_goal(goal: UserGoalCreate, current_user: dict = Depends(get_current_user)):
    """Create a new goal"""
    supabase = get_supabase_user_client(current_user["token"])
    
    goal_data = goal.model_dump()
    goal_data["user_id"] = str(current_user["user"].id)
    
    result = supabase.table("user_goals").insert(goal_data).execute()
    
    return result.data[0]
