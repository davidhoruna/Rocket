"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IdeaCard } from "@/components/idea-card"
import { ProjectHeader } from "@/components/project-header"
import { ProjectSidebar } from "@/components/project-sidebar"
import { createClient } from '@/utils/supabase/client'
import type { Idea } from '@/types/database'

type IdeaWithCounts = Idea & {
  lightbulbs: number;
  isLightbulbed: boolean;
}

type FilterState = {
  industries: string[];
  fields: string[];
  difficulty: number;
  privacy: string | null;
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<IdeaWithCounts[]>([])
  const [filters, setFilters] = useState<FilterState>({
    industries: [],
    fields: [],
    difficulty: 0,
    privacy: null,
  })
  const [sortBy, setSortBy] = useState<"popular" | "newest">("popular")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIdeas = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      const query = supabase
        .from('ideas')
        .select(`
          *,
          idea_lightbulbs(user_id)
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching ideas:', error)
        return
      }

      setIdeas(data.map(idea => ({
        ...idea,
        lightbulbs: idea.idea_lightbulbs?.length || 0,
        isLightbulbed: idea.idea_lightbulbs?.some((bulb: { user_id: string }) => bulb.user_id === session?.user?.id) || false
      })))
      setLoading(false)
    }

    fetchIdeas()
  }, [])

  const filteredIdeas = ideas
    .filter((idea) => {
      if (filters.industries.length > 0 && !filters.industries.includes(idea.industry)) {
        return false
      }
      if (filters.fields.length > 0 && !filters.fields.includes(idea.field)) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return b.lightbulbs - a.lightbulbs
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProjectHeader />

      <div className="flex">
        <ProjectSidebar 
          filters={filters} 
          setFilters={(newFilters: FilterState) => setFilters(newFilters)} 
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-medium">Ideas</h1>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowSortOptions(!showSortOptions)}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>Sort by: {sortBy === "popular" ? "Popular" : "Newest"}</span>
                </Button>

                {showSortOptions && (
                  <div className="absolute right-0 mt-1 w-40 bg-card border border-border rounded-md shadow-md overflow-hidden z-20">
                    <div
                      className={`px-3 py-2 text-sm hover:bg-accent cursor-pointer ${sortBy === "popular" ? "bg-accent" : ""}`}
                      onClick={() => {
                        setSortBy("popular")
                        setShowSortOptions(false)
                      }}
                    >
                      Popular
                    </div>
                    <div
                      className={`px-3 py-2 text-sm hover:bg-accent cursor-pointer ${sortBy === "newest" ? "bg-accent" : ""}`}
                      onClick={() => {
                        setSortBy("newest")
                        setShowSortOptions(false)
                      }}
                    >
                      Newest
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-foreground"></div>
              </div>
            ) : filteredIdeas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    id={idea.id}
                    title={idea.title}
                    description={idea.description}
                    industry={idea.industry}
                    field={idea.field}
                    lightbulbs={idea.lightbulbs}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No ideas found matching your criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

