"use client"

import { ProjectHeader } from "@/components/project-header"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProjectHeader />

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto">
          <Rocket className="h-16 w-16 mx-auto mb-6 text-foreground" />
          <h1 className="text-3xl font-bold mb-4">Showcase Coming Soon</h1>
          <p className="text-muted-foreground mb-8">
          </p>
          <Button className="bg-foreground text-background hover:bg-foreground/90">Back to Projects</Button>
        </div>
      </div>
    </div>
  )
}

