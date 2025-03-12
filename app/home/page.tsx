"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Heart, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/project-card"
import { IdeaCard } from "@/components/idea-card"
import { HomeSidebar } from "@/components/home-sidebar"
import { ProjectHeader } from "@/components/project-header"
import { MobileFilters } from "@/components/mobile-filters"
import { createClient } from '@/utils/supabase/client'
import type { Project, Idea } from '@/types/database'

type ProjectWithCounts = Project & {
  likes: number;
  collaborators: number;
  isLiked: boolean;
}

type IdeaWithCounts = Idea & {
  lightbulbs: number;
  isLightbulbed: boolean;
}

type FilterState = {
  industries: string[];
  fields: string[];
}

export default function HomePage() {
  const [projectSorting, setProjectSorting] = useState<"popular" | "newest">("popular")
  const [ideaSorting, setIdeaSorting] = useState<"popular" | "newest">("popular")
  const [filters, setFilters] = useState<FilterState>({
    industries: [],
    fields: [],
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [ideas, setIdeas] = useState<IdeaWithCounts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      // Fetch projects
      const projectsQuery = supabase
        .from('projects')
        .select(`
          *,
          project_likes(user_id),
          project_collaborators(user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(6)

      // Fetch ideas
      const ideasQuery = supabase
        .from('ideas')
        .select(`
          *,
          idea_lightbulbs(user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(6)

      const [projectsResult, ideasResult] = await Promise.all([
        projectsQuery,
        ideasQuery
      ])

      if (projectsResult.error) {
        console.error('Error fetching projects:', projectsResult.error)
      } else {
        setProjects(projectsResult.data.map(project => ({
          ...project,
          likes: project.project_likes?.length || 0,
          collaborators: project.project_collaborators?.length || 0,
          isLiked: project.project_likes?.some((like: { user_id: string }) => like.user_id === session?.user?.id) || false
        })))
      }

      if (ideasResult.error) {
        console.error('Error fetching ideas:', ideasResult.error)
      } else {
        setIdeas(ideasResult.data.map(idea => ({
          ...idea,
          lightbulbs: idea.idea_lightbulbs?.length || 0,
          isLightbulbed: idea.idea_lightbulbs?.some((bulb: { user_id: string }) => bulb.user_id === session?.user?.id) || false
        })))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      if (filters.industries.length > 0 && !filters.industries.includes(project.industry)) {
        return false
      }
      if (filters.fields.length > 0 && !filters.fields.includes(project.field)) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (projectSorting === "popular") {
        return b.likes - a.likes
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  // Filter and sort ideas
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
      if (ideaSorting === "popular") {
        return b.lightbulbs - a.lightbulbs
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProjectHeader />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-10">
        <div className="hidden lg:block">
          <HomeSidebar filters={filters} setFilters={setFilters} />
        </div>

        <main className="flex-1 p-4 md:p-6 lg:px-8">
          <div className="lg:hidden mb-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsSidebarOpen(true)}
            >
              Filters
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-foreground"></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Projects Section */}
                <section className="flex-1 border rounded-xl bg-card/50 backdrop-blur-sm">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-medium">Projects</h2>
                        
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={projectSorting === "popular" ? "text-foreground" : "text-muted-foreground"}
                            onClick={() => setProjectSorting("popular")}
                          >
                            Popular
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={projectSorting === "newest" ? "text-foreground" : "text-muted-foreground"}
                            onClick={() => setProjectSorting("newest")}
                          >
                            Newest
                          </Button>
                        </div>
                        <Link
                          href="/projects"
                          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                          View all
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-[500px] lg:h-[calc(100vh-220px)] overflow-y-auto p-4 md:p-6 pt-4">
                    <div className="flex flex-col gap-4">
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
                  </div>
                </section>

                {/* Ideas Section */}
                <section className="flex-1 border rounded-xl bg-card/50 backdrop-blur-sm">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-medium">Ideas</h2>
                        
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={ideaSorting === "popular" ? "text-foreground" : "text-muted-foreground"}
                            onClick={() => setIdeaSorting("popular")}
                          >
                            Popular
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={ideaSorting === "newest" ? "text-foreground" : "text-muted-foreground"}
                            onClick={() => setIdeaSorting("newest")}
                          >
                            Newest
                          </Button>
                        </div>
                        <Link href="/ideas" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                          View all
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-[500px] lg:h-[calc(100vh-220px)] overflow-y-auto p-4 md:p-6 pt-4">
                    <div className="flex flex-col gap-4">
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
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>

      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <MobileFilters
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  )
}

