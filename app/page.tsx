"use client"

import { useState } from "react"
import { Rocket } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div
        className="flex flex-col items-center cursor-pointer transition-all duration-500 ease-in-out"
        onClick={() => router.push("/home")}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className={`p-8 rounded-full bg-secondary hover:bg-accent transition-all duration-300 ${isHovering ? "animate-float shadow-lg" : "shadow-md"}`}
        >
          <Rocket
            className={`h-16 w-16 text-foreground transition-all duration-300 ${isHovering ? "scale-110" : ""}`}
          />
        </div>
        <p
          className={`mt-6 text-xl font-medium transition-all duration-300 ${isHovering ? "text-foreground" : "text-muted-foreground"}`}
        >
          Launch
        </p>
      </div>
    </div>
  )
}

