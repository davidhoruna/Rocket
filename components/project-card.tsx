"use client"

import type React from "react"

import { useState } from "react"
import { Heart, MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
  id: string
  title: string
  description: string
  image?: string
  industry: string
  field: string
  likes: number
  comments?: number
  isLiked?: boolean
  collaborators?: number
  showCollaborators?: boolean
  createdAt?: string
  showDate?: boolean
}

export function ProjectCard({
  id,
  title,
  description,
  image,
  industry,
  field,
  likes,
  comments,
  isLiked = false,
  collaborators,
  showCollaborators = false,
  createdAt,
  showDate = false,
}: ProjectCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [isHovering, setIsHovering] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <Link href={`/projects/${id}`}>
      <div
        className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md h-full"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        
        {/*
        <div className="aspect-video relative overflow-hidden">
          <div className="w-full h-full relative">
            <Image
              src={image || "/placeholder.svg?height=200&width=400"}
              alt={title}
              fill
              className={`object-cover transition-transform duration-300 ${isHovering ? "scale-105" : "scale-100"}`}
            />
          </div>
        </div>
        */}
        

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

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <button onClick={handleLike} className="flex items-center gap-1 text-xs">
                <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                <span className={liked ? "text-red-500" : "text-muted-foreground"}>{likeCount}</span>
              </button>

              {comments > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{comments}</span>
                </div>
              )}

              {showCollaborators && collaborators && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{collaborators}</span>
                </div>
              )}
            </div>

            {showDate && createdAt && (
              <div className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

