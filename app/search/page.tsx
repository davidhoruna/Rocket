"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProjectHeader } from "@/components/project-header"
import { ProjectCard } from "@/components/project-card"
import { IdeaCard } from "@/components/idea-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [activeTab, setActiveTab] = useState("all")
  const [results, setResults] = useState<{
    projects: any[]
    ideas: any[]
  }>({
    projects: [],
    ideas: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate search API call
    setLoading(true)
    setTimeout(() => {
      // Mock projects data
      const projects = [
        {
          id: "1",
          title: "AI-Powered Recipe Generator",
          description: "An application that generates recipes based on available ingredients using machine learning.",
          image: "/placeholder.svg?height=200&width=400",
          industry: "Technology",
          field: "AI/Machine Learning",
          difficulty: 4,
          likes: 24,
          comments: 8,
          isLiked: false,
        },
        {
          id: "2",
          title: "Healthcare Appointment Scheduler",
          description: "A platform for patients to book and manage healthcare appointments with ease.",
          image: "/placeholder.svg?height=200&width=400",
          industry: "Healthcare",
          field: "Web Development",
          difficulty: 3,
          likes: 18,
          comments: 5,
          isLiked: true,
        },
      ]

      // Mock ideas data
      const ideas = [
        {
          id: "1",
          title: "Sustainable Fashion Marketplace",
          description: "A platform connecting eco-conscious consumers with sustainable fashion brands.",
          industry: "Retail",
          field: "E-commerce",
          lightbulbs: 42,
          comments: 15,
        },
        {
          id: "2",
          title: "Mental Health Chatbot",
          description: "An AI-powered chatbot providing mental health support and resources.",
          industry: "Healthcare",
          field: "AI/Machine Learning",
          lightbulbs: 36,
          comments: 8,
        },
      ]

      // Filter based on search query
      const filteredProjects = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(query.toLowerCase()) ||
          project.description.toLowerCase().includes(query.toLowerCase()) ||
          project.industry.toLowerCase().includes(query.toLowerCase()) ||
          project.field.toLowerCase().includes(query.toLowerCase()),
      )

      const filteredIdeas = ideas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query.toLowerCase()) ||
          idea.description.toLowerCase().includes(query.toLowerCase()) ||
          idea.industry.toLowerCase().includes(query.toLowerCase()) ||
          idea.field.toLowerCase().includes(query.toLowerCase()),
      )

      setResults({
        projects: filteredProjects,
        ideas: filteredIdeas,
      })
      setLoading(false)
    }, 1000)
  }, [query])

  const totalResults = results.projects.length + results.ideas.length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProjectHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Search Results for "{query}"</h1>
          <p className="text-muted-foreground">{loading ? "Searching..." : `Found ${totalResults} results`}</p>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({results.projects.length})</TabsTrigger>
            <TabsTrigger value="ideas">Ideas ({results.ideas.length})</TabsTrigger>
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
                    {results.projects.length > 0 && (
                      <div>
                        <h2 className="text-xl font-medium mb-4">Projects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {results.projects.map((project) => (
                            <ProjectCard
                              key={project.id}
                              id={project.id}
                              title={project.title}
                              description={project.description}
                              image={project.image}
                              industry={project.industry}
                              field={project.field}
                              likes={project.likes}
                              comments={project.comments}
                              isLiked={project.isLiked}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {results.ideas.length > 0 && (
                      <div>
                        <h2 className="text-xl font-medium mb-4">Ideas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {results.ideas.map((idea) => (
                            <IdeaCard
                              key={idea.id}
                              id={idea.id}
                              title={idea.title}
                              description={idea.description}
                              industry={idea.industry}
                              field={idea.field}
                              lightbulbs={idea.lightbulbs}
                              comments={idea.comments}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No results found for "{query}"</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projects">
                {results.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        image={project.image}
                        industry={project.industry}
                        field={project.field}
                        likes={project.likes}
                        comments={project.comments}
                        isLiked={project.isLiked}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No projects found for "{query}"</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ideas">
                {results.ideas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.ideas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        id={idea.id}
                        title={idea.title}
                        description={idea.description}
                        industry={idea.industry}
                        field={idea.field}
                        lightbulbs={idea.lightbulbs}
                        comments={idea.comments}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No ideas found for "{query}"</p>
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

