"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Rocket, Plus, Search, User, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProjectHeader() {
  const router = useRouter()
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [user, setUser] = useState<any>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const addOptionsRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      setShowAddOptions(false)
      router.push('/login')
      return
    }
    setShowAddOptions(!showAddOptions)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        addOptionsRef.current &&
        !addOptionsRef.current.contains(event.target as Node) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target as Node)
      ) {
        setShowAddOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Rocket className="h-5 w-5" />
            <span className="font-medium text-sm hidden sm:inline-block">Rocket</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link href="/projects" className="text-sm hover:text-foreground text-muted-foreground">
              Projects
            </Link>
            <Link href="/ideas" className="text-sm hover:text-foreground text-muted-foreground">
              Ideas
            </Link>
            <Link href="/showcase" className="text-sm hover:text-foreground text-muted-foreground">
              Showcase
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-secondary rounded-md py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all duration-200 ${searchFocused ? "w-64" : "w-40"}`}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </form>

          <div className="relative">
            <Button
              ref={addButtonRef}
              variant="ghost"
              size="sm"
              className="rounded-md relative group"
              onClick={handleCreateClick}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Create</span>
            </Button>

            {showAddOptions && user && (
              <div
                ref={addOptionsRef}
                className="absolute right-0 mt-1 w-40 bg-card border border-border rounded-md shadow-md overflow-hidden z-20"
              >
                <Link href="/ideas/new">
                  <div className="px-3 py-2 text-sm hover:bg-accent cursor-pointer">Idea</div>
                </Link>
                <Link href="/projects/new">
                  <div className="px-3 py-2 text-sm hover:bg-accent cursor-pointer">Project</div>
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/login')}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Log in</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

