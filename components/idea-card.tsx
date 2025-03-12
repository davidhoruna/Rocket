"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Lightbulb, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface IdeaCardProps {
  id: string
  title: string
  description: string
  industry: string
  field: string
  lightbulbs: number
  comments?: number
}

export function IdeaCard({ id, title, description, industry, field, lightbulbs, comments = 0 }: IdeaCardProps) {
  const [liked, setLiked] = useState(false)
  const [bulbCount, setBulbCount] = useState(lightbulbs)
  const [isHovering, setIsHovering] = useState(false)

  const handleLightbulb = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    setBulbCount(liked ? bulbCount - 1 : bulbCount + 1)
  }

  return (
    <Link href={`/ideas/${id}`}>
      <div
        className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md h-full"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>

          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline" className="text-xs bg-secondary/50">
              {industry}
            </Badge>
            <Badge variant="outline" className="text-xs bg-secondary/50">
              {field}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <button onClick={handleLightbulb} className="flex items-center gap-1 text-xs">
                <Lightbulb
                  className={`h-3.5 w-3.5 ${liked ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                />
                <span className={liked ? "text-yellow-500" : "text-muted-foreground"}>{bulbCount}</span>
              </button>

              {comments > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{comments}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

