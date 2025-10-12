from openai import OpenAI
from backend.config import settings
from backend.database import get_supabase_user_client
from typing import List, Dict, Any
import json

client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_workout(user_id: str, token: str, preferences: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate a personalized workout using GPT-5 based on user profile and goals
    """
    supabase = get_supabase_user_client(token)
    
    # Fetch user profile
    profile_result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    profile = profile_result.data
    
    # Fetch user goals
    goals_result = supabase.table("user_goals").select("*").eq("user_id", user_id).execute()
    goals = goals_result.data
    
    # Fetch dietary preferences for context
    diet_result = supabase.table("dietary_preferences").select("*").eq("user_id", user_id).execute()
    dietary_prefs = diet_result.data
    
    # Fetch recent workouts for variety
    recent_workouts = supabase.table("workouts").select("title, workout_type").eq("user_id", user_id).order("scheduled_date", desc=True).limit(5).execute()
    
    # Build context for AI
    context = f"""
    User Profile:
    - Age: {profile.get('age', 'Not specified')}
    - Gender: {profile.get('gender', 'Not specified')}
    - Height: {profile.get('height_cm', 'Not specified')} cm
    - Weight: {profile.get('weight_kg', 'Not specified')} kg
    - Activity Level: {profile.get('activity_level', 'moderate')}
    
    Goals:
    {json.dumps([{'type': g['goal_type'], 'target': g.get('target_value'), 'unit': g.get('unit')} for g in goals], indent=2)}
    
    Recent Workouts (for variety):
    {json.dumps([{'title': w['title'], 'type': w['workout_type']} for w in recent_workouts.data], indent=2)}
    
    Additional Preferences:
    {json.dumps(preferences or {}, indent=2)}
    """
    
    # Generate workout using OpenAI
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are an expert fitness trainer and workout planner. Generate personalized, safe, and effective workouts based on user profiles and goals. 
                
                Return a JSON object with the following structure:
                {
                    "title": "Workout title",
                    "description": "Brief description",
                    "workout_type": "cardio|strength|flexibility|sports",
                    "duration_minutes": 30-90,
                    "intensity": "low|medium|high",
                    "calories_burned": estimated calories,
                    "exercises": [
                        {
                            "name": "Exercise name",
                            "sets": 3,
                            "reps": "10-12" or "duration in seconds",
                            "rest_seconds": 60,
                            "instructions": "How to perform",
                            "tips": "Safety tips and form cues"
                        }
                    ],
                    "warmup": "Warmup routine description",
                    "cooldown": "Cooldown routine description",
                    "notes": "Additional notes or modifications"
                }
                
                Consider:
                - User's fitness level and goals
                - Variety from recent workouts
                - Safety and proper progression
                - Equipment availability (assume basic home equipment)
                - Time efficiency
                """
            },
            {
                "role": "user",
                "content": f"Generate a personalized workout for this user:\n\n{context}"
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )
    
    workout_data = json.loads(response.choices[0].message.content)
    
    return workout_data

async def generate_weekly_workout_plan(user_id: str, token: str, days_per_week: int = 4) -> List[Dict[str, Any]]:
    """
    Generate a complete weekly workout plan
    """
    supabase = get_supabase_user_client(token)
    
    # Fetch user profile and goals
    profile_result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    profile = profile_result.data
    
    goals_result = supabase.table("user_goals").select("*").eq("user_id", user_id).execute()
    goals = goals_result.data
    
    context = f"""
    User Profile:
    - Age: {profile.get('age', 'Not specified')}
    - Activity Level: {profile.get('activity_level', 'moderate')}
    - Goals: {', '.join([g['goal_type'] for g in goals])}
    
    Days per week: {days_per_week}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are an expert fitness trainer creating weekly workout plans. Generate a balanced weekly plan with variety and proper recovery.
                
                Return a JSON object with:
                {
                    "plan": [
                        {
                            "day": 1-7,
                            "title": "Workout title",
                            "workout_type": "cardio|strength|flexibility|sports|rest",
                            "duration_minutes": 30-90,
                            "intensity": "low|medium|high",
                            "focus": "Main focus area",
                            "description": "Brief description"
                        }
                    ],
                    "notes": "Weekly plan notes and tips"
                }
                
                Ensure:
                - Balanced muscle group targeting
                - Adequate recovery days
                - Progressive difficulty
                - Variety to prevent boredom
                """
            },
            {
                "role": "user",
                "content": f"Generate a weekly workout plan:\n\n{context}"
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )
    
    plan_data = json.loads(response.choices[0].message.content)
    
    return plan_data["plan"]

async def get_exercise_recommendations(user_id: str, token: str, muscle_group: str = None, equipment: str = None) -> List[Dict[str, Any]]:
    """
    Get exercise recommendations for specific muscle groups or equipment
    """
    query = f"Recommend exercises"
    if muscle_group:
        query += f" for {muscle_group}"
    if equipment:
        query += f" using {equipment}"
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are a fitness expert. Provide exercise recommendations with proper form instructions.
                
                Return a JSON object:
                {
                    "exercises": [
                        {
                            "name": "Exercise name",
                            "difficulty": "beginner|intermediate|advanced",
                            "muscle_groups": ["primary", "secondary"],
                            "equipment": "required equipment",
                            "instructions": "Step by step",
                            "common_mistakes": "What to avoid",
                            "modifications": "Easier/harder variations"
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
        temperature=0.7
    )
    
    recommendations = json.loads(response.choices[0].message.content)
    
    return recommendations["exercises"]
