import { Dumbbell, Timer, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function WorkoutCard() {
  const exercises = [
    { name: "Leg Press", sets: 3, reps: 8, weight: "180kg" },
    { name: "Squats", sets: 4, reps: 12, weight: "100kg" },
    { name: "Leg Curls", sets: 3, reps: 10, weight: "60kg" },
  ]

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Dumbbell className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Today's Workout</h3>
          <p className="text-sm text-muted-foreground">Lower Body Focus</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          45 min
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        {exercises.map((exercise, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-sm text-foreground">{exercise.name}</p>
              <p className="text-xs text-muted-foreground">
                {exercise.sets} sets × {exercise.reps} reps
              </p>
            </div>
            <span className="text-sm font-medium text-accent">{exercise.weight}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1">
          <Timer className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
        <Button variant="outline" size="sm">
          <Target className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
