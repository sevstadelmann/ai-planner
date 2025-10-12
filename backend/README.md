# AI Planner Backend

FastAPI backend for the AI-powered fitness and meal planning application.

## Setup

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Create a `.env` file with the following variables:
\`\`\`
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_api_key
\`\`\`

3. Run the server:
\`\`\`bash
uvicorn backend.main:app --reload
\`\`\`

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

- `main.py` - FastAPI application entry point
- `config.py` - Configuration and environment variables
- `database.py` - Database connection utilities
- `auth.py` - Authentication middleware
- `models.py` - Pydantic models for request/response validation
- `routers/` - API route handlers organized by feature
