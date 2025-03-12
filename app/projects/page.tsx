"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/project-card"
import { ProjectHeader } from "@/components/project-header"
import { ProjectSidebar } from "@/components/project-sidebar"
import { createClient } from '@/utils/supabase/client'
import type { Project } from '@/types/database'

type FilterState = {
  industries: string[];
  fields: string[];
  difficulty: number;
  privacy: string | null;
}

type ProjectWithCounts = Project & {
  likes: number;
  collaborators: number;
  isLiked: boolean;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [filters, setFilters] = useState<FilterState>({
    industries: [],
    fields: [],
    difficulty: 0,
    privacy: null,
  })
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "collaborators">("popular")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      const query = supabase
        .from('projects')
        .select(`
          *,
          project_likes(user_id),
          project_collaborators(user_id)
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching projects:', error)
        return
      }

      setProjects(data.map(project => ({
        ...project,
        likes: project.project_likes?.length || 0,
        collaborators: project.project_collaborators?.length || 0,
        isLiked: project.project_likes?.some(like => like.user_id === session?.user?.id) || false
      })))
      setLoading(false)
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects
    .filter((project) => {
      if (filters.industries.length > 0 && !filters.industries.includes(project.industry)) {
        return false
      }
      if (filters.fields.length > 0 && !filters.fields.includes(project.field)) {
        return false
      }
      if (filters.privacy && project.privacy !== filters.privacy) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return (b.likes || 0) - (a.likes || 0)
      } else if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        return (b.collaborators || 0) - (a.collaborators || 0)
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
              <h1 className="text-xl font-medium">Projects</h1>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowSortOptions(!showSortOptions)}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>
                    Sort by: {sortBy === "popular" ? "Popular" : sortBy === "newest" ? "Newest" : "Collaborators"}
                  </span>
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
                    <div
                      className={`px-3 py-2 text-sm hover:bg-accent cursor-pointer ${sortBy === "collaborators" ? "bg-accent" : ""}`}
                      onClick={() => {
                        setSortBy("collaborators")
                        setShowSortOptions(false)
                      }}
                    >
                      Collaborators
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-foreground"></div>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    image={project.image}
                    industry={project.industry}
                    field={project.field}
                    likes={project.likes}
                    comments={0}
                    isLiked={project.isLiked}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found matching your criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

