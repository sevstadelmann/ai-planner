from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.services.ai_meal_planner import generate_meal, generate_daily_meal_plan, generate_weekly_meal_plan, get_recipe_suggestions
from backend.database import get_supabase_user_client
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, timedelta

router = APIRouter()

class MealGenerationRequest(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack
    cuisine: Optional[str] = None
    max_time: Optional[int] = None
    dietary_focus: Optional[str] = None

class DailyPlanRequest(BaseModel):
    date: date

class WeeklyPlanRequest(BaseModel):
    start_date: date

class RecipeSuggestionRequest(BaseModel):
    cuisine: Optional[str] = None
    max_time: Optional[int] = None

@router.post("/generate")
async def create_ai_meal(
    request: MealGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a personalized meal using AI
    """
    try:
        preferences = {
            "cuisine": request.cuisine,
            "max_time": request.max_time,
            "dietary_focus": request.dietary_focus
        }
        
        meal_data = await generate_meal(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            meal_type=request.meal_type,
            preferences=preferences
        )
        
        return {
            "success": True,
            "meal": meal_data,
            "message": "Meal generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate meal: {str(e)}")

@router.post("/generate-and-save")
async def generate_and_save_meal(
    request: MealGenerationRequest,
    scheduled_date: date,
    scheduled_time: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a meal and save it to the user's schedule
    """
    try:
        preferences = {
            "cuisine": request.cuisine,
            "max_time": request.max_time,
            "dietary_focus": request.dietary_focus
        }
        
        meal_data = await generate_meal(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            meal_type=request.meal_type,
            preferences=preferences
        )
        
        # Save to database
        supabase = get_supabase_user_client(current_user["token"])
        
        meal_record = {
            "user_id": str(current_user["user"].id),
            "title": meal_data["title"],
            "description": meal_data["description"],
            "meal_type": meal_data["meal_type"],
            "calories": meal_data["calories"],
            "protein_g": meal_data["protein_g"],
            "carbs_g": meal_data["carbs_g"],
            "fat_g": meal_data["fat_g"],
            "ingredients": meal_data["ingredients"],
            "scheduled_date": scheduled_date.isoformat(),
            "scheduled_time": scheduled_time,
            "notes": f"Prep: {meal_data.get('prep_time_minutes', 0)}min | Cook: {meal_data.get('cook_time_minutes', 0)}min\n\nInstructions:\n{chr(10).join([f'{i+1}. {step}' for i, step in enumerate(meal_data.get('instructions', []))])}\n\nTips: {meal_data.get('tips', '')}"
        }
        
        result = supabase.table("meals").insert(meal_record).execute()
        
        return {
            "success": True,
            "meal": result.data[0],
            "ai_details": meal_data,
            "message": "Meal generated and saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate and save meal: {str(e)}")

@router.post("/daily-plan")
async def create_daily_plan(
    request: DailyPlanRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a complete daily meal plan
    """
    try:
        plan = await generate_daily_meal_plan(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            date=request.date.isoformat()
        )
        
        return {
            "success": True,
            "plan": plan,
            "message": "Daily meal plan generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate daily plan: {str(e)}")

@router.post("/weekly-plan")
async def create_weekly_plan(
    request: WeeklyPlanRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a complete weekly meal plan
    """
    try:
        plan = await generate_weekly_meal_plan(
            user_id=str(current_user["user"].id),
            token=current_user["token"]
        )
        
        return {
            "success": True,
            "plan": plan,
            "message": "Weekly meal plan generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate weekly plan: {str(e)}")

@router.post("/recipe-suggestions")
async def get_suggestions(
    request: RecipeSuggestionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Get recipe suggestions based on criteria
    """
    try:
        recipes = await get_recipe_suggestions(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            cuisine=request.cuisine,
            max_time=request.max_time
        )
        
        return {
            "success": True,
            "recipes": recipes,
            "message": "Recipe suggestions generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")
