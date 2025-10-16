from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime
from uuid import UUID

# Profile Models
class ProfileBase(BaseModel):
    display_name: Optional[str] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: UUID
    email: str
    created_at: datetime
    updated_at: datetime

# Workout Models
class WorkoutBase(BaseModel):
    title: str
    description: Optional[str] = None
    workout_type: str
    duration_minutes: Optional[int] = None
    calories_burned: Optional[int] = None
    intensity: Optional[str] = None
    scheduled_date: date
    scheduled_time: Optional[time] = None
    notes: Optional[str] = None

class WorkoutCreate(WorkoutBase):
    pass

class WorkoutUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None

class Workout(WorkoutBase):
    id: UUID
    user_id: UUID
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# Meal Models
class MealBase(BaseModel):
    title: str
    description: Optional[str] = None
    meal_type: str
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    ingredients: Optional[dict] = None
    recipe_url: Optional[str] = None
    scheduled_date: date
    scheduled_time: Optional[time] = None
    notes: Optional[str] = None

class MealCreate(MealBase):
    pass

class MealUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None

class Meal(MealBase):
    id: UUID
    user_id: UUID
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# Health Tracking Models
class SleepTrackingCreate(BaseModel):
    date: date
    duration_hours: float
    quality_rating: int = Field(ge=1, le=5)
    notes: Optional[str] = None

class WeightTrackingCreate(BaseModel):
    date: date
    weight_kg: float
    notes: Optional[str] = None

class WaterIntakeCreate(BaseModel):
    date: date
    amount_ml: int

# Goal Models
class UserGoalCreate(BaseModel):
    goal_type: str
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    deadline: Optional[date] = None

class UserGoal(UserGoalCreate):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
