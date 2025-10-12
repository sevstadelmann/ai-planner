"use client"

import { useState } from "react"
import { MapPin, ChevronRight, ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ScheduleCardProps {
  time: string
  type: "meal" | "workout" | "activity"
  title: string
  description: string
  details: string
  image?: string
  location?: string
  actionText: string
  expandedContent?: {
    ingredients?: string[]
    nutrition?: { calories: number; protein: number; carbs: number; fat: number }
    instructions?: string[]
    equipment?: string[]
    duration?: string
    difficulty?: "Easy" | "Medium" | "Hard"
  }
}

export function ScheduleCard({
  time,
  type,
  title,
  description,
  details,
  image,
  location,
  actionText,
  expandedContent,
}: ScheduleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meal":
        return "text-green-400"
      case "workout":
        return "text-blue-400"
      case "activity":
        return "text-orange-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="bg-card border-border p-4 hover:bg-card/80 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-sm font-medium text-foreground">{time}</span>
          <div className={`w-2 h-2 rounded-full mt-1 ${getTypeColor(type).replace("text-", "bg-")}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-foreground text-balance">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {image && (
              <img
                src={image || "/placeholder.svg"}
                alt={description}
                className="w-12 h-12 rounded-lg object-cover ml-3 flex-shrink-0"
              />
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3 text-pretty">{details}</p>

          {location && (
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{location}</span>
            </div>
          )}

          {isExpanded && expandedContent && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              {expandedContent.ingredients && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-foreground mb-2">Ingredients</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {expandedContent.ingredients.map((ingredient, index) => (
                      <li key={index}>• {ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {expandedContent.nutrition && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-foreground mb-2">Nutrition</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {expandedContent.nutrition.calories} cal
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {expandedContent.nutrition.protein}g protein
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {expandedContent.nutrition.carbs}g carbs
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {expandedContent.nutrition.fat}g fat
                    </Badge>
                  </div>
                </div>
              )}

              {expandedContent.instructions && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-foreground mb-2">Instructions</h4>
                  <ol className="text-xs text-muted-foreground space-y-1">
                    {expandedContent.instructions.map((instruction, index) => (
                      <li key={index}>
                        {index + 1}. {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {expandedContent.equipment && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-foreground mb-2">Equipment</h4>
                  <div className="flex gap-1 flex-wrap">
                    {expandedContent.equipment.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {expandedContent.duration && (
                <div className="mb-3">
                  <Badge variant="secondary" className="text-xs">
                    Duration: {expandedContent.duration}
                  </Badge>
                </div>
              )}

              {expandedContent.difficulty && (
                <div className="mb-3">
                  <Badge
                    variant={
                      expandedContent.difficulty === "Easy"
                        ? "secondary"
                        : expandedContent.difficulty === "Medium"
                          ? "default"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {expandedContent.difficulty}
                  </Badge>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-0 text-accent hover:text-accent/80 hover:bg-transparent"
            >
              {actionText}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>

            {expandedContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1" />
                    More
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
