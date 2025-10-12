from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.database import get_supabase_user_client

router = APIRouter()

@router.get("/")
async def get_integrations(current_user: dict = Depends(get_current_user)):
    """Get user's connected integrations"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("external_integrations").select("id, provider, connected_at, last_synced_at, is_active").eq("user_id", current_user["user"].id).execute()
    
    return result.data

@router.delete("/{integration_id}")
async def disconnect_integration(integration_id: str, current_user: dict = Depends(get_current_user)):
    """Disconnect an integration"""
    supabase = get_supabase_user_client(current_user["token"])
    
    result = supabase.table("external_integrations").delete().eq("id", integration_id).eq("user_id", current_user["user"].id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {"message": "Integration disconnected successfully"}
