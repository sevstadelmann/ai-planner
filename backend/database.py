from supabase import create_client, Client
from backend.config import settings

def get_supabase_client() -> Client:
    """Create and return a Supabase client"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def get_supabase_user_client(access_token: str) -> Client:
    """Create a Supabase client with user's access token for RLS"""
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    supabase.auth.set_session(access_token, "")
    return supabase
