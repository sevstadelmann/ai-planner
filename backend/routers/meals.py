from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.models import Meal, MealCreate, MealUpdate
from backend.database import get_supabase_user_client
from typing import List, Optional
from datetime import date

router = APIRouter()

@router.get("/", response_model=List[Meal])
async def get_meals(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's meals with optional date filtering"""
    supabase = get_supabase_user_client(current_user["token"])
    
    query = supabase.table("meals").select("*").eq("user_id", current_user["user"].id)
    
    if start_date:
        query = query.gte("scheduled_date", start_date.isoformat())
    if end_date:
        query = query.lte("scheduled_date", end_date.isoformat())
    
    result = query.order("scheduled_date").execute()
    
    return result.data

@router.post("/", response_model=Meal)
async def create_meal(meal: MealCreate, current_user: dict = Depends(get_current_user)):
    """Create a new meal"""
    supabase = get_supabase_user_client(current_user["token"])
    
    meal_data = meal.model_dump()
    meal_data["user_id"] = str(current_user["user"].id)
    
    result = supabase.table("meals").insert(meal_data).execute()
    
    return result.data[0]

@router.patch("/{meal_id}", response_model=Meal)
async def update_meal(
    meal_id: str,
    meal_update: MealUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a meal"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("meals").update(meal_update.model_dump(exclude_unset=True)).eq("id", meal_id).eq("user_id", current_user["user"].id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    return result.data[0]

@router.delete("/{meal_id}")
async def delete_meal(meal_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a meal"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("meals").delete().eq("id", meal_id).eq("user_id", current_user["user"].id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    return {"message": "Meal deleted successfully"}
