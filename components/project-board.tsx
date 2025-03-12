"use client"

import { useState } from "react"
import { ProjectCard } from "./project-card"
import { ProjectHeader } from "./project-header"
import { ProjectSidebar } from "./project-sidebar"

export default function ProjectBoard() {
  const [filters, setFilters] = useState({
    industries: [],
    fields: [],
    difficulty: 0,
    privacy: null,
  })

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
    {
      id: "3",
      title: "Educational AR Mobile App",
      description: "An augmented reality app that makes learning interactive and engaging for students.",
      image: "/placeholder.svg?height=200&width=400",
      industry: "Education",
      field: "Mobile Apps",
      difficulty: 5,
      likes: 32,
      comments: 12,
      isLiked: false,
    },
    {
      id: "4",
      title: "Personal Finance Dashboard",
      description: "A comprehensive dashboard to track expenses, investments, and financial goals.",
      image: "/placeholder.svg?height=200&width=400",
      industry: "Finance",
      field: "Data Science",
      difficulty: 2,
      likes: 15,
      comments: 3,
      isLiked: false,
    },
    {
      id: "5",
      title: "Smart Home IoT Controller",
      description: "A centralized system to manage all smart home devices from a single interface.",
      image: "/placeholder.svg?height=200&width=400",
      industry: "Technology",
      field: "Hardware",
      difficulty: 4,
      likes: 27,
      comments: 9,
      isLiked: true,
    },
    {
      id: "6",
      title: "Interactive Music Learning Platform",
      description: "A platform that teaches music theory and instrument playing through interactive lessons.",
      image: "/placeholder.svg?height=200&width=400",
      industry: "Entertainment",
      field: "Web Development",
      difficulty: 3,
      likes: 21,
      comments: 7,
      isLiked: false,
    },
  ]

  // Filter projects based on selected filters
  const filteredProjects = projects.filter((project) => {
    if (filters.industries.length > 0 && !filters.industries.includes(project.industry)) {
      return false
    }
    if (filters.fields.length > 0 && !filters.fields.includes(project.field)) {
      return false
    }
    if (filters.difficulty > 0 && project.difficulty > filters.difficulty) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProjectHeader />

      <div className="flex">
        <ProjectSidebar filters={filters} setFilters={setFilters} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-medium mb-6">Discover Projects</h1>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    image={project.image}
                    industry={project.industry}
                    field={project.field}
                    difficulty={project.difficulty}
                    likes={project.likes}
                    comments={project.comments}
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

