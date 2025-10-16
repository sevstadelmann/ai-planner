from backend.services.ai_workout_generator import generate_workout, generate_weekly_workout_plan
from backend.services.ai_meal_planner import generate_meal, generate_daily_meal_plan
from backend.database import get_supabase_user_client
from typing import Dict, Any, List
from datetime import date, datetime, timedelta
import asyncio

async def generate_daily_schedule(user_id: str, token: str, target_date: date) -> Dict[str, Any]:
    """
    Generate a complete daily schedule with workouts and meals
    """
    supabase = get_supabase_user_client(token)
    
    # Check if schedule already exists for this date
    existing_workouts = supabase.table("workouts").select("*").eq("user_id", user_id).eq("scheduled_date", target_date.isoformat()).execute()
    existing_meals = supabase.table("meals").select("*").eq("user_id", user_id).eq("scheduled_date", target_date.isoformat()).execute()
    
    schedule = {
        "date": target_date.isoformat(),
        "workouts": [],
        "meals": [],
        "generated": False
    }
    
    # If schedule exists, return it
    if existing_workouts.data or existing_meals.data:
        schedule["workouts"] = existing_workouts.data
        schedule["meals"] = existing_meals.data
        schedule["generated"] = False
        return schedule
    
    # Generate new schedule
    try:
        # Generate workout and meals in parallel
        workout_task = generate_workout(user_id, token, preferences={"scheduled_date": target_date.isoformat()})
        meal_plan_task = generate_daily_meal_plan(user_id, token, target_date.isoformat())
        
        workout_data, meal_plan_data = await asyncio.gather(workout_task, meal_plan_task)
        
        # Save workout
        workout_record = {
            "user_id": user_id,
            "title": workout_data["title"],
            "description": workout_data["description"],
            "workout_type": workout_data["workout_type"],
            "duration_minutes": workout_data["duration_minutes"],
            "calories_burned": workout_data.get("calories_burned"),
            "intensity": workout_data["intensity"],
            "scheduled_date": target_date.isoformat(),
            "scheduled_time": "07:00:00",  # Default morning workout
            "notes": f"AI Generated\n\nExercises:\n{chr(10).join([f'- {ex['name']}: {ex.get('sets', '')}x{ex.get('reps', '')}' for ex in workout_data.get('exercises', [])])}"
        }
        
        workout_result = supabase.table("workouts").insert(workout_record).execute()
        schedule["workouts"] = workout_result.data
        
        # Save meals
        meal_times = {
            "breakfast": "08:00:00",
            "lunch": "12:30:00",
            "dinner": "18:30:00",
            "snack": "15:00:00"
        }
        
        saved_meals = []
        for meal_type, meal_data in meal_plan_data["meals"].items():
            meal_record = {
                "user_id": user_id,
                "title": meal_data["title"],
                "description": meal_data["description"],
                "meal_type": meal_data["meal_type"],
                "calories": meal_data["calories"],
                "protein_g": meal_data["protein_g"],
                "carbs_g": meal_data["carbs_g"],
                "fat_g": meal_data["fat_g"],
                "ingredients": meal_data["ingredients"],
                "scheduled_date": target_date.isoformat(),
                "scheduled_time": meal_times.get(meal_type),
                "notes": f"AI Generated\n\nInstructions:\n{chr(10).join([f'{i+1}. {step}' for i, step in enumerate(meal_data.get('instructions', []))])}"
            }
            
            meal_result = supabase.table("meals").insert(meal_record).execute()
            saved_meals.extend(meal_result.data)
        
        schedule["meals"] = saved_meals
        schedule["generated"] = True
        schedule["daily_nutrition"] = meal_plan_data["daily_totals"]
        
        return schedule
        
    except Exception as e:
        raise Exception(f"Failed to generate daily schedule: {str(e)}")

async def generate_weekly_schedule(user_id: str, token: str, start_date: date, days_per_week: int = 4) -> Dict[str, Any]:
    """
    Generate a complete weekly schedule with workouts and meals
    """
    supabase = get_supabase_user_client(token)
    
    try:
        # Generate workout plan and meal plan in parallel
        workout_plan_task = generate_weekly_workout_plan(user_id, token, days_per_week)
        
        workout_plan = await workout_plan_task
        
        weekly_schedule = {
            "start_date": start_date.isoformat(),
            "end_date": (start_date + timedelta(days=6)).isoformat(),
            "days": []
        }
        
        # Generate schedule for each day
        for day_num in range(7):
            current_date = start_date + timedelta(days=day_num)
            
            # Check if it's a workout day
            workout_for_day = next((w for w in workout_plan if w["day"] == day_num + 1), None)
            
            day_schedule = {
                "date": current_date.isoformat(),
                "day_name": current_date.strftime("%A"),
                "workouts": [],
                "meals": []
            }
            
            # Save workout if it's a workout day
            if workout_for_day and workout_for_day["workout_type"] != "rest":
                workout_record = {
                    "user_id": user_id,
                    "title": workout_for_day["title"],
                    "description": workout_for_day["description"],
                    "workout_type": workout_for_day["workout_type"],
                    "duration_minutes": workout_for_day["duration_minutes"],
                    "intensity": workout_for_day["intensity"],
                    "scheduled_date": current_date.isoformat(),
                    "scheduled_time": "07:00:00",
                    "notes": f"Focus: {workout_for_day.get('focus', '')}"
                }
                
                workout_result = supabase.table("workouts").insert(workout_record).execute()
                day_schedule["workouts"] = workout_result.data
            
            # Generate and save meals for each day
            meal_plan = await generate_daily_meal_plan(user_id, token, current_date.isoformat())
            
            meal_times = {
                "breakfast": "08:00:00",
                "lunch": "12:30:00",
                "dinner": "18:30:00",
                "snack": "15:00:00"
            }
            
            saved_meals = []
            for meal_type, meal_data in meal_plan["meals"].items():
                meal_record = {
                    "user_id": user_id,
                    "title": meal_data["title"],
                    "description": meal_data["description"],
                    "meal_type": meal_data["meal_type"],
                    "calories": meal_data["calories"],
                    "protein_g": meal_data["protein_g"],
                    "carbs_g": meal_data["carbs_g"],
                    "fat_g": meal_data["fat_g"],
                    "ingredients": meal_data["ingredients"],
                    "scheduled_date": current_date.isoformat(),
                    "scheduled_time": meal_times.get(meal_type),
                    "notes": f"Prep: {meal_data.get('prep_time_minutes', 0)}min"
                }
                
                meal_result = supabase.table("meals").insert(meal_record).execute()
                saved_meals.extend(meal_result.data)
            
            day_schedule["meals"] = saved_meals
            day_schedule["daily_nutrition"] = meal_plan["daily_totals"]
            
            weekly_schedule["days"].append(day_schedule)
        
        return weekly_schedule
        
    except Exception as e:
        raise Exception(f"Failed to generate weekly schedule: {str(e)}")

async def get_schedule(user_id: str, token: str, start_date: date, end_date: date) -> Dict[str, Any]:
    """
    Get existing schedule for a date range
    """
    supabase = get_supabase_user_client(token)
    
    # Fetch workouts
    workouts_result = supabase.table("workouts").select("*").eq("user_id", user_id).gte("scheduled_date", start_date.isoformat()).lte("scheduled_date", end_date.isoformat()).order("scheduled_date").execute()
    
    # Fetch meals
    meals_result = supabase.table("meals").select("*").eq("user_id", user_id).gte("scheduled_date", start_date.isoformat()).lte("scheduled_date", end_date.isoformat()).order("scheduled_date").execute()
    
    # Organize by date
    schedule_by_date = {}
    
    for workout in workouts_result.data:
        workout_date = workout["scheduled_date"]
        if workout_date not in schedule_by_date:
            schedule_by_date[workout_date] = {"date": workout_date, "workouts": [], "meals": []}
        schedule_by_date[workout_date]["workouts"].append(workout)
    
    for meal in meals_result.data:
        meal_date = meal["scheduled_date"]
        if meal_date not in schedule_by_date:
            schedule_by_date[meal_date] = {"date": meal_date, "workouts": [], "meals": []}
        schedule_by_date[meal_date]["meals"].append(meal)
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "schedule": list(schedule_by_date.values())
    }

async def update_schedule_item(user_id: str, token: str, item_type: str, item_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update a workout or meal in the schedule
    """
    supabase = get_supabase_user_client(token)
    
    table_name = "workouts" if item_type == "workout" else "meals"
    
    result = supabase.table(table_name).update(updates).eq("id", item_id).eq("user_id", user_id).execute()
    
    if not result.data:
        raise Exception(f"{item_type.capitalize()} not found")
    
    return result.data[0]

async def delete_schedule_item(user_id: str, token: str, item_type: str, item_id: str) -> bool:
    """
    Delete a workout or meal from the schedule
    """
    supabase = get_supabase_user_client(token)
    
    table_name = "workouts" if item_type == "workout" else "meals"
    
    result = supabase.table(table_name).delete().eq("id", item_id).eq("user_id", user_id).execute()
    
    return len(result.data) > 0
