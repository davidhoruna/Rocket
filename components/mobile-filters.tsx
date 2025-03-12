import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function MobileFilters({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters 
}: { 
  isOpen: boolean
  onClose: () => void
  filters: { industries: string[], fields: string[] }
  setFilters: (filters: any) => void 
}) {
  return (
    <div 
      className={`fixed inset-x-0 top-0 z-50 bg-card border-b transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Simple filter buttons */}
          <div>
            <h3 className="text-sm font-medium mb-2">Industries</h3>
            <div className="flex flex-wrap gap-2">
              {["Technology", "Healthcare", "Education", "Finance"].map((industry) => (
                <Button
                  key={industry}
                  variant="outline"
                  size="sm"
                  className={filters.industries.includes(industry) ? "bg-accent" : ""}
                  onClick={() => {
                    setFilters({
                      ...filters,
                      industries: filters.industries.includes(industry)
                        ? filters.industries.filter(i => i !== industry)
                        : [...filters.industries, industry]
                    })
                  }}
                >
                  {industry}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Fields</h3>
            <div className="flex flex-wrap gap-2">
              {["AI/ML", "Web Dev", "Mobile", "Data Science"].map((field) => (
                <Button
                  key={field}
                  variant="outline"
                  size="sm"
                  className={filters.fields.includes(field) ? "bg-accent" : ""}
                  onClick={() => {
                    setFilters({
                      ...filters,
                      fields: filters.fields.includes(field)
                        ? filters.fields.filter(f => f !== field)
                        : [...filters.fields, field]
                    })
                  }}
                >
                  {field}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
