from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Database
    DATABASE_URL: str
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://*.vercel.app"]
    
    # External APIs
    STRAVA_CLIENT_ID: str = ""
    STRAVA_CLIENT_SECRET: str = ""
    NUTRITION_API_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
