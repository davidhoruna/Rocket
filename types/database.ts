export type Project = {
  id: string
  title: string
  description: string
  image?: string
  industry: string
  field: string
  privacy: string
  user_id: string
  created_at: string
  likes?: number
  collaborators?: number
  github_url?: string
  twitter_url?: string
  instagram_url?: string
  linkedin_url?: string
}

export type Idea = {
  id: string
  title: string
  description: string
  industry: string
  field: string
  lightbulbs: number
  created_at: string
  user_id: string
}

// For likes/lightbulbs tracking
export type ProjectLike = {
  project_id: string
  user_id: string
}

export type IdeaLightbulb = {
  idea_id: string
  user_id: string
} 