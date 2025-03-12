"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProjectHeader } from "@/components/project-header"
import { ProjectCard } from "@/components/project-card"
import { IdeaCard } from "@/components/idea-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/client"
import type { Project, Idea } from "@/types/database"

type ProjectWithCounts = Project & {
  likes: number
  isLiked: boolean
}

type IdeaWithCounts = Idea & {
  lightbulbs: number
  isLightbulbed: boolean
}

function SearchComponent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  return <SearchResults query={query} />
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchComponent />
    </Suspense>
  )
}

function SearchResults({ query }: { query: string }) {
  const [activeTab, setActiveTab] = useState("all")
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [ideas, setIdeas] = useState<IdeaWithCounts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      // Fetch projects matching the search query
      const projectsQuery = supabase
        .from("projects")
        .select(`
          *,
          project_likes(user_id),
        `)
        .ilike("title", `%${query}%`) // Case-insensitive search
        .limit(10)

      // Fetch ideas matching the search query
      const ideasQuery = supabase
        .from("ideas")
        .select(`
          *,
          idea_lightbulbs(user_id)
        `)
        .ilike("title", `%${query}%`) // Case-insensitive search
        .limit(10)

      const [projectsResult, ideasResult] = await Promise.all([
        projectsQuery,
        ideasQuery
      ])

      if (projectsResult.error) {
        console.error("Error fetching projects:", projectsResult.error)
      } else {
        setProjects(projectsResult.data.map((project) => ({
          ...project,
          likes: project.project_likes?.length || 0,
          isLiked: project.project_likes?.some((like: { user_id: string }) => like.user_id === session?.user?.id) || false
        })))
      }

      if (ideasResult.error) {
        console.error("Error fetching ideas:", ideasResult.error)
      } else {
        setIdeas(ideasResult.data.map((idea) => ({
          ...idea,
          lightbulbs: idea.idea_lightbulbs?.length || 0,
          isLightbulbed: idea.idea_lightbulbs?.some((bulb: { user_id: string }) => bulb.user_id === session?.user?.id) || false
        })))
      }

      setLoading(false)
    }

    fetchData()
  }, [query])

  const totalResults = projects.length + ideas.length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProjectHeader />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Search Results for "{query}"</h1>
          <p className="text-muted-foreground">
            {loading ? "Searching..." : `Found ${totalResults} results`}
          </p>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="ideas">Ideas ({ideas.length})</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-8">
                {totalResults > 0 ? (
                  <>
                    {projects.length > 0 && (
                      <div>
                        <h2 className="text-xl font-medium mb-4">Projects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {projects.map((project) => (
                            <ProjectCard key={project.id} {...project} />
                          ))}
                        </div>
                      </div>
                    )}

                    {ideas.length > 0 && (
                      <div>
                        <h2 className="text-xl font-medium mb-4">Ideas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {ideas.map((idea) => (
                            <IdeaCard key={idea.id} {...idea} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No results found for "{query}"
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projects">
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} {...project} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No projects found for "{query}"
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ideas">
                {ideas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.map((idea) => (
                      <IdeaCard key={idea.id} {...idea} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No ideas found for "{query}"
                    </p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
