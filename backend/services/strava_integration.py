import httpx
from backend.config import settings
from backend.database import get_supabase_user_client
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
STRAVA_API_BASE = "https://www.strava.com/api/v3"

async def get_authorization_url(redirect_uri: str, state: str) -> str:
    """
    Generate Strava OAuth authorization URL
    """
    params = {
        "client_id": settings.STRAVA_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "read,activity:read_all,activity:write",
        "state": state
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return f"{STRAVA_AUTH_URL}?{query_string}"

async def exchange_code_for_token(code: str) -> Dict[str, Any]:
    """
    Exchange authorization code for access token
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            STRAVA_TOKEN_URL,
            data={
                "client_id": settings.STRAVA_CLIENT_ID,
                "client_secret": settings.STRAVA_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code"
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to exchange code: {response.text}")
        
        return response.json()

async def refresh_access_token(refresh_token: str) -> Dict[str, Any]:
    """
    Refresh expired access token
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            STRAVA_TOKEN_URL,
            data={
                "client_id": settings.STRAVA_CLIENT_ID,
                "client_secret": settings.STRAVA_CLIENT_SECRET,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token"
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to refresh token: {response.text}")
        
        return response.json()

async def get_valid_token(user_id: str, token: str) -> str:
    """
    Get a valid access token, refreshing if necessary
    """
    supabase = get_supabase_user_client(token)
    
    # Get Strava integration
    result = supabase.table("external_integrations").select("*").eq("user_id", user_id).eq("provider", "strava").single().execute()
    
    if not result.data:
        raise Exception("Strava not connected")
    
    integration = result.data
    
    # Check if token is expired
    expires_at = datetime.fromisoformat(integration["token_expires_at"].replace("Z", "+00:00"))
    
    if datetime.now(expires_at.tzinfo) >= expires_at:
        # Refresh token
        token_data = await refresh_access_token(integration["refresh_token"])
        
        # Update integration
        supabase.table("external_integrations").update({
            "access_token": token_data["access_token"],
            "refresh_token": token_data["refresh_token"],
            "token_expires_at": datetime.fromtimestamp(token_data["expires_at"]).isoformat()
        }).eq("id", integration["id"]).execute()
        
        return token_data["access_token"]
    
    return integration["access_token"]

async def get_athlete_stats(user_id: str, token: str) -> Dict[str, Any]:
    """
    Get athlete statistics from Strava
    """
    access_token = await get_valid_token(user_id, token)
    
    async with httpx.AsyncClient() as client:
        # Get athlete profile
        athlete_response = await client.get(
            f"{STRAVA_API_BASE}/athlete",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if athlete_response.status_code != 200:
            raise Exception(f"Failed to get athlete: {athlete_response.text}")
        
        athlete = athlete_response.json()
        
        # Get athlete stats
        stats_response = await client.get(
            f"{STRAVA_API_BASE}/athletes/{athlete['id']}/stats",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if stats_response.status_code != 200:
            raise Exception(f"Failed to get stats: {stats_response.text}")
        
        stats = stats_response.json()
        
        return {
            "athlete": athlete,
            "stats": stats
        }

async def get_activities(user_id: str, token: str, after: Optional[datetime] = None, before: Optional[datetime] = None, per_page: int = 30) -> List[Dict[str, Any]]:
    """
    Get activities from Strava
    """
    access_token = await get_valid_token(user_id, token)
    
    params = {"per_page": per_page}
    
    if after:
        params["after"] = int(after.timestamp())
    if before:
        params["before"] = int(before.timestamp())
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STRAVA_API_BASE}/athlete/activities",
            headers={"Authorization": f"Bearer {access_token}"},
            params=params
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to get activities: {response.text}")
        
        return response.json()

async def sync_activities(user_id: str, token: str, days: int = 7) -> Dict[str, Any]:
    """
    Sync recent activities from Strava to database
    """
    supabase = get_supabase_user_client(token)
    
    # Get activities from last N days
    after = datetime.now() - timedelta(days=days)
    activities = await get_activities(user_id, token, after=after)
    
    synced_count = 0
    skipped_count = 0
    
    for activity in activities:
        # Check if activity already exists
        existing = supabase.table("workouts").select("id").eq("user_id", user_id).eq("notes", f"Strava ID: {activity['id']}").execute()
        
        if existing.data:
            skipped_count += 1
            continue
        
        # Map Strava activity type to our workout type
        activity_type_map = {
            "Run": "cardio",
            "Ride": "cardio",
            "Swim": "cardio",
            "Walk": "cardio",
            "Hike": "cardio",
            "WeightTraining": "strength",
            "Workout": "strength",
            "Yoga": "flexibility",
            "Crossfit": "strength"
        }
        
        workout_type = activity_type_map.get(activity["type"], "cardio")
        
        # Create workout record
        workout_record = {
            "user_id": user_id,
            "title": activity["name"],
            "description": f"Synced from Strava - {activity['type']}",
            "workout_type": workout_type,
            "duration_minutes": int(activity["moving_time"] / 60),
            "calories_burned": int(activity.get("calories", 0)),
            "intensity": "high" if activity.get("average_heartrate", 0) > 150 else "medium" if activity.get("average_heartrate", 0) > 120 else "low",
            "scheduled_date": activity["start_date_local"].split("T")[0],
            "scheduled_time": activity["start_date_local"].split("T")[1].split("Z")[0],
            "completed": True,
            "completed_at": activity["start_date"],
            "notes": f"Strava ID: {activity['id']}\nDistance: {activity.get('distance', 0) / 1000:.2f} km\nElevation: {activity.get('total_elevation_gain', 0)} m\nAvg HR: {activity.get('average_heartrate', 'N/A')}"
        }
        
        supabase.table("workouts").insert(workout_record).execute()
        synced_count += 1
    
    # Update last synced timestamp
    supabase.table("external_integrations").update({
        "last_synced_at": datetime.now().isoformat()
    }).eq("user_id", user_id).eq("provider", "strava").execute()
    
    return {
        "synced": synced_count,
        "skipped": skipped_count,
        "total": len(activities)
    }

async def create_activity(user_id: str, token: str, workout_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create an activity on Strava from a workout
    """
    access_token = await get_valid_token(user_id, token)
    
    # Map our workout type to Strava activity type
    type_map = {
        "cardio": "Run",
        "strength": "WeightTraining",
        "flexibility": "Yoga",
        "sports": "Workout"
    }
    
    activity_data = {
        "name": workout_data["title"],
        "type": type_map.get(workout_data["workout_type"], "Workout"),
        "start_date_local": f"{workout_data['scheduled_date']}T{workout_data.get('scheduled_time', '12:00:00')}Z",
        "elapsed_time": workout_data["duration_minutes"] * 60,
        "description": workout_data.get("description", ""),
        "trainer": 1,  # Indoor activity
        "commute": 0
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STRAVA_API_BASE}/activities",
            headers={"Authorization": f"Bearer {access_token}"},
            json=activity_data
        )
        
        if response.status_code not in [200, 201]:
            raise Exception(f"Failed to create activity: {response.text}")
        
        return response.json()
