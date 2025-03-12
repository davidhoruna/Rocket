"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HomeSidebar } from "@/components/home-sidebar"
import { ProjectSidebar } from "@/components/project-sidebar"

interface MobileSidebarToggleProps {
  type: "home" | "project"
  filters: any
  setFilters: (filters: any) => void
}

export function MobileSidebarToggle({ type, filters, setFilters }: MobileSidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-card"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border overflow-auto">
            {type === "home" ? (
              <HomeSidebar filters={filters} setFilters={setFilters} />
            ) : (
              <ProjectSidebar filters={filters} setFilters={setFilters} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

