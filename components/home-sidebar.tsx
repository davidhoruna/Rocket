"use client"

import { useState } from "react"
import { ChevronDown, Hash, Star, Clock, Filter, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FilterState {
  industries: string[]
  fields: string[]
  difficulty: number
  privacy: string | null
}

interface ProjectSidebarProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
}

export function HomeSidebar({ filters, setFilters }: ProjectSidebarProps) {
  const [industriesOpen, setIndustriesOpen] = useState(true)
  const [fieldsOpen, setFieldsOpen] = useState(true)
  const [expanded, setExpanded] = useState(true)

  const industries = ["Technology", "Healthcare", "Education", "Finance", "Entertainment"]
  const fields = ["Web Development", "Mobile Apps", "AI/Machine Learning", "Data Science", "Design", "Hardware"]

  const toggleIndustry = (industry: string) => {
    if (filters.industries.includes(industry)) {
      setFilters({
        ...filters,
        industries: filters.industries.filter((i) => i !== industry),
      })
    } else {
      setFilters({
        ...filters,
        industries: [...filters.industries, industry],
      })
    }
  }

  const toggleField = (field: string) => {
    if (filters.fields.includes(field)) {
      setFilters({
        ...filters,
        fields: filters.fields.filter((f) => f !== field),
      })
    } else {
      setFilters({
        ...filters,
        fields: [...filters.fields, field],
      })
    }
  }

  const setDifficulty = (value: number) => {
    setFilters({
      ...filters,
      difficulty: filters.difficulty === value ? 0 : value,
    })
  }

  return (
    <div
      className={`${expanded ? "w-56" : "w-16"} transition-all duration-300 border-r border-border h-[calc(100vh-57px)] overflow-auto py-4 px-2 relative`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setExpanded(!expanded)}
      >
        <ArrowLeftRight className="h-4 w-4" />
      </Button>

      {expanded ? (
        <>
          <div className="mb-4 px-2 mt-4">
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </span>
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setFilters({ industries: [], fields: [], difficulty: 0, privacy: null })}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="space-y-4">
             
            {/* Industries */}
            <div>
              <button
                className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                onClick={() => setIndustriesOpen(!industriesOpen)}
              >
                <span className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" />
                  Industries
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${industriesOpen ? "rotate-180" : ""}`} />
              </button>

              {industriesOpen && (
                <div className="mt-1 ml-2 space-y-1">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      className={cn(
                        "flex items-center w-full px-2 py-1 text-xs rounded-md transition-colors",
                        filters.industries.includes(industry)
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                      onClick={() => toggleIndustry(industry)}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fields */}
            <div>
              <button
                className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                onClick={() => setFieldsOpen(!fieldsOpen)}
              >
                <span className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" />
                  Fields
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${fieldsOpen ? "rotate-180" : ""}`} />
              </button>

              {fieldsOpen && (
                <div className="mt-1 ml-2 space-y-1">
                  {fields.map((field) => (
                    <button
                      key={field}
                      className={cn(
                        "flex items-center w-full px-2 py-1 text-xs rounded-md transition-colors",
                        filters.fields.includes(field)
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                      onClick={() => toggleField(field)}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Difficulty */}
            

           
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center mt-10 space-y-6">
          <Filter className="h-5 w-5" />
          
        </div>
      )}
    </div>
  )
}

