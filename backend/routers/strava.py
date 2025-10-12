from fastapi import APIRouter, Depends, HTTPException, Query
from backend.auth import get_current_user
from backend.services.strava_integration import (
    get_authorization_url,
    exchange_code_for_token,
    get_athlete_stats,
    get_activities,
    sync_activities,
    create_activity
)
from backend.database import get_supabase_user_client
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter()

class StravaConnectRequest(BaseModel):
    redirect_uri: str

class StravaCallbackRequest(BaseModel):
    code: str

class StravaSyncRequest(BaseModel):
    days: int = 7

class StravaCreateActivityRequest(BaseModel):
    workout_id: str

@router.post("/connect")
async def connect_strava(
    request: StravaConnectRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Get Strava authorization URL
    """
    try:
        state = f"{current_user['user'].id}:{datetime.now().timestamp()}"
        auth_url = await get_authorization_url(request.redirect_uri, state)
        
        return {
            "success": True,
            "authorization_url": auth_url,
            "message": "Redirect user to this URL to authorize Strava"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate authorization URL: {str(e)}")

@router.post("/callback")
async def strava_callback(
    request: StravaCallbackRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Handle Strava OAuth callback
    """
    try:
        # Exchange code for token
        token_data = await exchange_code_for_token(request.code)
        
        # Save integration
        supabase = get_supabase_user_client(current_user["token"])
        
        integration_data = {
            "user_id": str(current_user["user"].id),
            "provider": "strava",
            "access_token": token_data["access_token"],
            "refresh_token": token_data["refresh_token"],
            "token_expires_at": datetime.fromtimestamp(token_data["expires_at"]).isoformat(),
            "is_active": True,
            "metadata": {
                "athlete_id": token_data["athlete"]["id"],
                "athlete_name": f"{token_data['athlete']['firstname']} {token_data['athlete']['lastname']}"
            }
        }
        
        # Upsert integration
        result = supabase.table("external_integrations").upsert(integration_data, on_conflict="user_id,provider").execute()
        
        return {
            "success": True,
            "integration": result.data[0],
            "message": "Strava connected successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect Strava: {str(e)}")

@router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """
    Get athlete statistics from Strava
    """
    try:
        stats = await get_athlete_stats(
            user_id=str(current_user["user"].id),
            token=current_user["token"]
        )
        
        return {
            "success": True,
            "stats": stats,
            "message": "Stats retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.get("/activities")
async def get_strava_activities(
    days: int = Query(default=7, ge=1, le=90),
    current_user: dict = Depends(get_current_user)
):
    """
    Get recent activities from Strava
    """
    try:
        after = datetime.now() - timedelta(days=days)
        activities = await get_activities(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            after=after
        )
        
        return {
            "success": True,
            "activities": activities,
            "count": len(activities),
            "message": f"Retrieved {len(activities)} activities"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get activities: {str(e)}")

@router.post("/sync")
async def sync_strava_activities(
    request: StravaSyncRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Sync activities from Strava to database
    """
    try:
        result = await sync_activities(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            days=request.days
        )
        
        return {
            "success": True,
            "sync_result": result,
            "message": f"Synced {result['synced']} activities, skipped {result['skipped']} duplicates"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync activities: {str(e)}")

@router.post("/create-activity")
async def push_activity_to_strava(
    request: StravaCreateActivityRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Push a workout to Strava as an activity
    """
    try:
        # Get workout
        supabase = get_supabase_user_client(current_user["token"])
        workout_result = supabase.table("workouts").select("*").eq("id", request.workout_id).eq("user_id", current_user["user"].id).single().execute()
        
        if not workout_result.data:
            raise HTTPException(status_code=404, detail="Workout not found")
        
        workout = workout_result.data
        
        # Create activity on Strava
        activity = await create_activity(
            user_id=str(current_user["user"].id),
            token=current_user["token"],
            workout_data=workout
        )
        
        return {
            "success": True,
            "activity": activity,
            "message": "Activity created on Strava successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create activity: {str(e)}")

@router.delete("/disconnect")
async def disconnect_strava(current_user: dict = Depends(get_current_user)):
    """
    Disconnect Strava integration
    """
    try:
        supabase = get_supabase_user_client(current_user["token"])
        
        result = supabase.table("external_integrations").delete().eq("user_id", current_user["user"].id).eq("provider", "strava").execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Strava integration not found")
        
        return {
            "success": True,
            "message": "Strava disconnected successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disconnect Strava: {str(e)}")
