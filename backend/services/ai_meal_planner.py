from openai import OpenAI
from backend.config import settings
from backend.database import get_supabase_user_client
from typing import List, Dict, Any
import json

client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_meal(user_id: str, token: str, meal_type: str, preferences: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate a personalized meal using GPT based on user profile, goals, and dietary restrictions
    """
    supabase = get_supabase_user_client(token)
    
    # Fetch user profile
    profile_result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    profile = profile_result.data
    
    # Fetch user goals
    goals_result = supabase.table("user_goals").select("*").eq("user_id", user_id).execute()
    goals = goals_result.data
    
    # Fetch dietary preferences and restrictions
    diet_result = supabase.table("dietary_preferences").select("*").eq("user_id", user_id).execute()
    dietary_prefs = diet_result.data
    
    # Fetch recent meals for variety
    recent_meals = supabase.table("meals").select("title, meal_type").eq("user_id", user_id).order("scheduled_date", desc=True).limit(7).execute()
    
    # Calculate nutritional needs based on profile and goals
    weight_kg = profile.get('weight_kg', 70)
    activity_level = profile.get('activity_level', 'moderate')
    
    # Basic calorie calculation (can be refined)
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }
    
    bmr = 10 * weight_kg + 6.25 * profile.get('height_cm', 170) - 5 * profile.get('age', 30)
    if profile.get('gender') == 'female':
        bmr -= 161
    else:
        bmr += 5
    
    daily_calories = bmr * activity_multipliers.get(activity_level, 1.55)
    
    # Adjust based on goals
    goal_types = [g['goal_type'] for g in goals]
    if 'Lose Weight' in goal_types:
        daily_calories *= 0.85  # 15% deficit
    elif 'Build Muscle' in goal_types:
        daily_calories *= 1.1  # 10% surplus
    
    # Meal calorie distribution
    meal_percentages = {
        'breakfast': 0.25,
        'lunch': 0.35,
        'dinner': 0.30,
        'snack': 0.10
    }
    
    target_calories = int(daily_calories * meal_percentages.get(meal_type, 0.30))
    
    # Build context for AI
    restrictions = [d['value'] for d in dietary_prefs if d['preference_type'] == 'restriction']
    allergies = [d['value'] for d in dietary_prefs if d['preference_type'] == 'allergy']
    preferences_list = [d['value'] for d in dietary_prefs if d['preference_type'] == 'preference']
    
    context = f"""
    User Profile:
    - Weight: {weight_kg} kg
    - Height: {profile.get('height_cm', 170)} cm
    - Age: {profile.get('age', 30)}
    - Activity Level: {activity_level}
    - Daily Calorie Target: {int(daily_calories)} kcal
    
    Goals: {', '.join(goal_types)}
    
    Dietary Restrictions: {', '.join(restrictions) if restrictions else 'None'}
    Allergies: {', '.join(allergies) if allergies else 'None'}
    Preferences: {', '.join(preferences_list) if preferences_list else 'None'}
    
    Meal Type: {meal_type}
    Target Calories for this meal: {target_calories} kcal
    
    Recent Meals (for variety):
    {json.dumps([{'title': m['title'], 'type': m['meal_type']} for m in recent_meals.data], indent=2)}
    
    Additional Preferences:
    {json.dumps(preferences or {}, indent=2)}
    """
    
    # Generate meal using OpenAI
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are an expert nutritionist and meal planner. Generate personalized, nutritious, and delicious meals based on user profiles, goals, and dietary restrictions.
                
                Return a JSON object with the following structure:
                {
                    "title": "Meal name",
                    "description": "Brief appetizing description",
                    "meal_type": "breakfast|lunch|dinner|snack",
                    "calories": total calories,
                    "protein_g": protein in grams,
                    "carbs_g": carbohydrates in grams,
                    "fat_g": fat in grams,
                    "fiber_g": fiber in grams,
                    "ingredients": [
                        {
                            "name": "Ingredient name",
                            "amount": "quantity",
                            "unit": "g|ml|cup|tbsp|etc",
                            "calories": calories from this ingredient
                        }
                    ],
                    "instructions": [
                        "Step 1",
                        "Step 2",
                        "..."
                    ],
                    "prep_time_minutes": preparation time,
                    "cook_time_minutes": cooking time,
                    "servings": number of servings,
                    "tags": ["quick", "high-protein", "vegetarian", etc],
                    "tips": "Cooking tips and variations",
                    "nutrition_notes": "Why this meal supports their goals"
                }
                
                Consider:
                - User's dietary restrictions and allergies (MUST comply)
                - Nutritional goals and calorie targets
                - Variety from recent meals
                - Balanced macronutrients
                - Practical and achievable recipes
                - Seasonal and accessible ingredients
                """
            },
            {
                "role": "user",
                "content": f"Generate a personalized {meal_type} for this user:\n\n{context}"
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.8
    )
    
    meal_data = json.loads(response.choices[0].message.content)
    
    return meal_data

async def generate_daily_meal_plan(user_id: str, token: str, date: str) -> Dict[str, Any]:
    """
    Generate a complete daily meal plan with all meals
    """
    meals = {}
    
    for meal_type in ['breakfast', 'lunch', 'dinner', 'snack']:
        meal_data = await generate_meal(user_id, token, meal_type)
        meals[meal_type] = meal_data
    
    # Calculate daily totals
    total_calories = sum(m['calories'] for m in meals.values())
    total_protein = sum(m['protein_g'] for m in meals.values())
    total_carbs = sum(m['carbs_g'] for m in meals.values())
    total_fat = sum(m['fat_g'] for m in meals.values())
    
    return {
        "date": date,
        "meals": meals,
        "daily_totals": {
            "calories": total_calories,
            "protein_g": total_protein,
            "carbs_g": total_carbs,
            "fat_g": total_fat
        }
    }

async def generate_weekly_meal_plan(user_id: str, token: str) -> List[Dict[str, Any]]:
    """
    Generate a complete weekly meal plan
    """
    supabase = get_supabase_user_client(token)
    
    # Fetch user profile and goals
    profile_result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    profile = profile_result.data
    
    goals_result = supabase.table("user_goals").select("*").eq("user_id", user_id).execute()
    goals = goals_result.data
    
    diet_result = supabase.table("dietary_preferences").select("*").eq("user_id", user_id).execute()
    dietary_prefs = diet_result.data
    
    restrictions = [d['value'] for d in dietary_prefs if d['preference_type'] == 'restriction']
    
    context = f"""
    User Profile:
    - Goals: {', '.join([g['goal_type'] for g in goals])}
    - Dietary Restrictions: {', '.join(restrictions) if restrictions else 'None'}
    - Activity Level: {profile.get('activity_level', 'moderate')}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are an expert meal planner creating weekly meal plans. Generate a balanced, varied weekly plan.
                
                Return a JSON object with:
                {
                    "weekly_plan": [
                        {
                            "day": 1-7,
                            "day_name": "Monday",
                            "breakfast": "Meal title",
                            "lunch": "Meal title",
                            "dinner": "Meal title",
                            "snack": "Meal title",
                            "theme": "Optional daily theme"
                        }
                    ],
                    "shopping_list": {
                        "produce": ["item1", "item2"],
                        "proteins": ["item1", "item2"],
                        "grains": ["item1", "item2"],
                        "dairy": ["item1", "item2"],
                        "pantry": ["item1", "item2"]
                    },
                    "meal_prep_tips": "Tips for preparing meals in advance",
                    "notes": "Weekly plan notes"
                }
                
                Ensure:
                - Variety throughout the week
                - Balanced nutrition
                - Practical meal prep
                - Ingredient reuse to minimize waste
                """
            },
            {
                "role": "user",
                "content": f"Generate a weekly meal plan:\n\n{context}"
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.8
    )
    
    plan_data = json.loads(response.choices[0].message.content)
    
    return plan_data

async def get_recipe_suggestions(user_id: str, token: str, cuisine: str = None, max_time: int = None) -> List[Dict[str, Any]]:
    """
    Get recipe suggestions based on criteria
    """
    supabase = get_supabase_user_client(token)
    
    # Fetch dietary restrictions
    diet_result = supabase.table("dietary_preferences").select("*").eq("user_id", user_id).execute()
    dietary_prefs = diet_result.data
    
    restrictions = [d['value'] for d in dietary_prefs if d['preference_type'] in ['restriction', 'allergy']]
    
    query = f"Suggest recipes"
    if cuisine:
        query += f" from {cuisine} cuisine"
    if max_time:
        query += f" that can be made in under {max_time} minutes"
    if restrictions:
        query += f" that are {', '.join(restrictions)}"
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are a recipe expert. Provide recipe suggestions with clear instructions.
                
                Return a JSON object:
                {
                    "recipes": [
                        {
                            "title": "Recipe name",
                            "cuisine": "cuisine type",
                            "difficulty": "easy|medium|hard",
                            "prep_time": minutes,
                            "cook_time": minutes,
                            "servings": number,
                            "calories_per_serving": calories,
                            "description": "Brief description",
                            "key_ingredients": ["ingredient1", "ingredient2"],
                            "tags": ["quick", "healthy", etc]
                        }
                    ]
                }
                """
            },
            {
                "role": "user",
                "content": query
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.8
    )
    
    suggestions = json.loads(response.choices[0].message.content)
    
    return suggestions["recipes"]
