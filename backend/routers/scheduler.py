from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.services.scheduler import (
    generate_daily_schedule,
    generate_weekly_schedule,
    get_schedule,
    update_schedule_item,
    delete_schedule_item
)
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date

router = APIRouter()

class DailyScheduleRequest(BaseModel):
    date: date

class WeeklyScheduleRequest(BaseModel):
    start_date: date
    days_per_week: int = 4

class ScheduleRangeRequest(BaseModel):
    start_date: date
    end_date: date

class UpdateScheduleItemRequest(BaseModel):
    item_type: str  # "workout" or "meal"
    item_id: str
    updates: Dict[str, Any]

@router.post("/daily")
async def create_daily_schedule(
    request: DailyScheduleRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a complete daily schedule with AI-generated workouts and meals
    """
    try:
        schedule = await generate_daily_schedule(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            target_date=request.date
        )
        
        return {
            "success": True,
            "schedule": schedule,
            "message": "Daily schedule generated successfully" if schedule["generated"] else "Existing schedule retrieved"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate daily schedule: {str(e)}")

@router.post("/weekly")
async def create_weekly_schedule(
    request: WeeklyScheduleRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a complete weekly schedule with AI-generated workouts and meals
    """
    try:
        schedule = await generate_weekly_schedule(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            start_date=request.start_date,
            days_per_week=request.days_per_week
        )
        
        return {
            "success": True,
            "schedule": schedule,
            "message": f"Weekly schedule generated for {len(schedule['days'])} days"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate weekly schedule: {str(e)}")

@router.post("/get")
async def get_schedule_range(
    request: ScheduleRangeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Get existing schedule for a date range
    """
    try:
        schedule = await get_schedule(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        return {
            "success": True,
            "schedule": schedule,
            "message": "Schedule retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get schedule: {str(e)}")

@router.patch("/update")
async def update_item(
    request: UpdateScheduleItemRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a workout or meal in the schedule
    """
    try:
        updated_item = await update_schedule_item(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            item_type=request.item_type,
            item_id=request.item_id,
            updates=request.updates
        )
        
        return {
            "success": True,
            "item": updated_item,
            "message": f"{request.item_type.capitalize()} updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update {request.item_type}: {str(e)}")

@router.delete("/{item_type}/{item_id}")
async def delete_item(
    item_type: str,
    item_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a workout or meal from the schedule
    """
    try:
        success = await delete_schedule_item(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            item_type=item_type,
            item_id=item_id
        )
        
        if not success:
            raise HTTPException(status_code=404, detail=f"{item_type.capitalize()} not found")
        
        return {
            "success": True,
            "message": f"{item_type.capitalize()} deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete {item_type}: {str(e)}")
