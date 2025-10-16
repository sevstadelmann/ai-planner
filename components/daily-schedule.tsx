import { ScheduleCard } from "@/components/schedule-card"
import { WorkoutCard } from "@/components/workout-card"
import { ProductSuggestionCard } from "@/components/product-suggestion-card"

const scheduleData = [
  {
    id: "1",
    time: "07:00",
    type: "meal" as const,
    title: "Breakfast",
    description: "Protein Overnight Oats",
    details: "High-protein breakfast to fuel your morning workout",
    image: "/healthy-breakfast-oats.jpg",
    actionText: "view recipe",
    expandedContent: {
      ingredients: [
        "1/2 cup rolled oats",
        "1 scoop vanilla protein powder",
        "1 tbsp chia seeds",
        "1/2 cup almond milk",
        "1 tbsp honey",
        "1/4 cup blueberries",
      ],
      nutrition: {
        calories: 420,
        protein: 28,
        carbs: 45,
        fat: 12,
      },
      instructions: [
        "Mix oats, protein powder, and chia seeds in a jar",
        "Add almond milk and honey, stir well",
        "Refrigerate overnight",
        "Top with blueberries before serving",
      ],
    },
  },
  {
    id: "2",
    time: "08:30",
    type: "workout" as const,
    title: "Morning Workout",
    description: "Upper Body Strength",
    details: "Focus on chest, shoulders, and triceps",
    location: "FitLife Gym, Downtown",
    actionText: "start workout",
    expandedContent: {
      equipment: ["Barbell", "Dumbbells", "Bench"],
      duration: "45 minutes",
      difficulty: "Medium" as const,
      instructions: [
        "Warm up with 5 minutes light cardio",
        "Bench press: 4 sets x 8-10 reps",
        "Shoulder press: 3 sets x 10-12 reps",
        "Tricep dips: 3 sets x 12-15 reps",
        "Cool down with stretching",
      ],
    },
  },
  {
    id: "3",
    time: "12:30",
    type: "meal" as const,
    title: "Lunch",
    description: "Grilled Chicken Salad",
    details: "Post-workout recovery meal with lean protein",
    image: "/grilled-chicken-salad.png",
    actionText: "view recipe",
    expandedContent: {
      ingredients: [
        "150g grilled chicken breast",
        "2 cups mixed greens",
        "1/2 avocado",
        "1/4 cup cherry tomatoes",
        "2 tbsp olive oil vinaigrette",
      ],
      nutrition: {
        calories: 380,
        protein: 35,
        carbs: 12,
        fat: 22,
      },
    },
  },
  {
    id: "4",
    time: "15:00",
    type: "activity" as const,
    title: "Hydration Reminder",
    description: "Drink 500ml water",
    details: "Stay hydrated for optimal performance",
    actionText: "mark complete",
  },
  {
    id: "5",
    time: "18:00",
    type: "meal" as const,
    title: "Abendessen",
    description: "Chicken Tikka Masala",
    details: "Flavorful Indian cuisine with basmati rice",
    image: "/chicken-tikka-masala.png",
    actionText: "read more",
    expandedContent: {
      ingredients: [
        "200g chicken breast, cubed",
        "1/2 cup basmati rice",
        "1/4 cup tikka masala sauce",
        "1 tbsp yogurt",
        "Fresh cilantro for garnish",
      ],
      nutrition: {
        calories: 520,
        protein: 42,
        carbs: 38,
        fat: 18,
      },
      instructions: [
        "Cook basmati rice according to package instructions",
        "Marinate chicken in yogurt and spices for 30 minutes",
        "Cook chicken until golden brown",
        "Add tikka masala sauce and simmer",
        "Serve over rice with cilantro",
      ],
    },
  },
  {
    id: "6",
    time: "19:30",
    type: "workout" as const,
    title: "Gym",
    description: "Leg Press 3 × 8 Sets à 180kg",
    details: "Lower body strength training session",
    location: "Bundespl. 2A",
    actionText: "read more",
    expandedContent: {
      equipment: ["Leg Press Machine", "Squat Rack"],
      duration: "60 minutes",
      difficulty: "Hard" as const,
      instructions: [
        "Warm up with 10 minutes on stationary bike",
        "Leg press: 3 sets x 8 reps at 180kg",
        "Squats: 4 sets x 10 reps",
        "Leg curls: 3 sets x 12 reps",
        "Calf raises: 3 sets x 15 reps",
      ],
    },
  },
]

export function DailySchedule() {
  return (
    <div className="px-4 py-6 space-y-4">
      {scheduleData.map((item) => (
        <ScheduleCard key={item.id} {...item} />
      ))}

      <WorkoutCard />
      <ProductSuggestionCard />
    </div>
  )
}
