from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.models import SleepTrackingCreate, WeightTrackingCreate, WaterIntakeCreate
from backend.database import get_supabase_user_client
from typing import List, Optional
from datetime import date

router = APIRouter()

@router.post("/sleep")
async def track_sleep(sleep_data: SleepTrackingCreate, current_user: dict = Depends(get_current_user)):
    """Track sleep data"""
    supabase = get_supabase_user_client(current_user["token"])
    
    data = sleep_data.model_dump()
    data["user_id"] = str(current_user["user"].id)
    
    result = supabase.table("sleep_tracking").insert(data).execute()
    
    return result.data[0]

@router.get("/sleep")
async def get_sleep_data(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get sleep tracking data"""
    supabase = get_supabase_user_client(current_user["token"])
    
    query = supabase.table("sleep_tracking").select("*").eq("user_id", current_user["user"].id)
    
    if start_date:
        query = query.gte("date", start_date.isoformat())
    if end_date:
        query = query.lte("date", end_date.isoformat())
    
    result = query.order("date", desc=True).execute()
    
    return result.data

@router.post("/weight")
async def track_weight(weight_data: WeightTrackingCreate, current_user: dict = Depends(get_current_user)):
    """Track weight data"""
    supabase = get_supabase_user_client(current_user["token"])
    
    data = weight_data.model_dump()
    data["user_id"] = str(current_user["user"].id)
    
    result = supabase.table("weight_tracking").insert(data).execute()
    
    return result.data[0]

@router.get("/weight")
async def get_weight_data(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get weight tracking data"""
    supabase = get_supabase_user_client(current_user["token"])
    
    query = supabase.table("weight_tracking").select("*").eq("user_id", current_user["user"].id)
    
    if start_date:
        query = query.gte("date", start_date.isoformat())
    if end_date:
        query = query.lte("date", end_date.isoformat())
    
    result = query.order("date", desc=True).execute()
    
    return result.data

@router.post("/water")
async def track_water(water_data: WaterIntakeCreate, current_user: dict = Depends(get_current_user)):
    """Track water intake"""
    supabase = get_supabase_user_client(current_user["token"])
    
    data = water_data.model_dump()
    data["user_id"] = str(current_user["user"].id)
    
    result = supabase.table("water_intake").insert(data).execute()
    
    return result.data[0]

@router.get("/water")
async def get_water_data(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get water intake data"""
    supabase = get_supabase_user_client(current_user["token"])
    
    query = supabase.table("water_intake").select("*").eq("user_id", current_user["user"].id)
    
    if start_date:
        query = query.gte("date", start_date.isoformat())
    if end_date:
        query = query.lte("date", end_date.isoformat())
    
    result = query.order("date", desc=True).execute()
    
    return result.data
