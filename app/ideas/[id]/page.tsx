"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lightbulb, Share2, MessageSquare, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProjectHeader } from "@/components/project-header"
import { createClient } from '@/utils/supabase/client'
import type { Idea } from '@/types/database'

type IdeaWithDetails = Idea & {
  lightbulbs: number;
  collaborators: number;
  isLightbulbed: boolean;
  isCollaborator: boolean;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  comments: {
    id: string;
    text: string;
    created_at: string;
    user: {
      id: string;
      email: string;
      full_name?: string;
      avatar_url?: string;
    };
  }[];
}

type ProjectComment = {
  id: string;
  text: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [idea, setIdea] = useState<IdeaWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchIdea = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const { data: ideaData, error: ideaError } = await supabase
        .from('ideas')
        .select(`
          *,
          user:profiles!ideas_user_id_fkey(id, email, full_name, avatar_url)`)
        .eq('id', params.id)
        .single()


      if (ideaError) {
        console.error('Error fetching idea:', ideaError)
        return
      }

      const { data: likes } = await supabase
        .from('idea_lightbulbs')
        .select('user_id')
        .eq('idea_id', params.id)
      
        const { data: collaborators } = await supabase
        .from('idea_collaborators')
        .select('user_id')
        .eq('idea_id', params.id)

        const { data: comments } = await supabase
        .from('idea_comments')
        .select(`
          id,
          text,
          created_at,
          user:profiles!idea_comments_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('idea_id', params.id)
        .order('created_at', { ascending: false })

      setIdea({
        ...ideaData,
        lightbulbs: likes?.length || 0,
        collaborators: collaborators?.length || 0,
        isLightbulbed: likes?.some(bulb => bulb.user_id === session?.user?.id) || false,
        comments: comments || []
      })
      setLoading(false)
    }

    fetchIdea()
  }, [params.id])

  const handleLightbulb = async () => {
    if (!idea) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('idea_lightbulbs')
      .upsert(
        { idea_id: idea.id, user_id: session.user.id },
        { onConflict: 'idea_id,user_id' }
      )

    if (error) {
      console.error('Error lightbulbing idea:', error)
      return
    }

    (prev: { lightbulbs: number; isLightbulbed: boolean } | null) => prev ? {
      ...prev,
      lightbulbs: prev.isLightbulbed ? prev.lightbulbs - 1 : prev.lightbulbs + 1,
      isLightbulbed: !prev.isLightbulbed
    } : null
    
  }
  const handleColab = async () => {
    if (!idea) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('project_collaborators')
      .upsert(
        { project_id: idea.id, user_id: session.user.id },
        { onConflict: 'project_id,user_id' }
      )

    if (error) {
      console.error('Error joining project:', error)
      return
    } 

    setIdea(prev => prev ? {
      ...prev,
      colabs: prev.isCollaborator ? prev.collaborators : prev.collaborators + 1,
    } : null)    
  }

  const handleComment = async () => {
    if (!comment.trim() || !idea) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    setSubmittingComment(true)

    const { data: newComment, error } = await supabase
      .from('idea_comments')
      .insert({
        idea_id: idea.id,
        user_id: session.user.id,
        text: comment.trim()
      })
      .select(`
        id,
        text,
        created_at,
        user:profiles!idea_comments_user_id_fkey(id, full_name, avatar_url)

      `)
      .single() as { data: ProjectComment | null, error: any }

    if (error) {
      console.error('Error posting comment:', error)
    } else if (newComment) {
      setIdea(prev => prev ? {
        ...prev,
        comments: [newComment, ...prev.comments]
      } : null)
      setComment("")
    }

    setSubmittingComment(false)
  }

  const handleConvertToProject = async () => {
    if (!idea) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    // Create new project from idea
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title: idea.title,
        description: idea.description,
        industry: idea.industry,
        field: idea.field,
        user_id: session.user.id
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error converting to project:', projectError)
      return
    }


    // Redirect to the new project
    router.push(`/projects/${project.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Idea not found</h1>
          <Link href="/ideas">
            <Button>Back to Ideas</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProjectHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link href="/ideas" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ideas
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">{idea.title}</h1>
              <p className="text-muted-foreground whitespace-pre-line">{idea.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="bg-secondary text-foreground border-border">
                {idea.industry}
              </Badge>
              <Badge variant="outline" className="bg-secondary text-foreground border-border">
                {idea.field}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 ${idea.isLightbulbed ? "bg-yellow-900/20 border-yellow-500 text-yellow-500" : "border-border"}`}
                  onClick={handleLightbulb}
                >
                  <Lightbulb className={`h-4 w-4 ${idea.isLightbulbed ? "fill-yellow-500" : ""}`} />
                  <span>{idea.lightbulbs}</span>
                </Button>

                <Button variant="outline" size="sm" className="flex items-center gap-2 border-border">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Posted on {new Date(idea.created_at).toLocaleDateString()}
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold">Comments</h2>

              <div className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-secondary border-border mb-2"
                  disabled={submittingComment}
                />
                <Button
                  onClick={handleComment}
                  disabled={!comment.trim() || submittingComment}
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>

              <div className="space-y-4">
                {idea.comments.length > 0 ? (
                  idea.comments.map((comment) => (
                    <Card key={comment.id} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={comment.user.avatar_url || undefined} />
                            <AvatarFallback>
                              {comment.user.full_name?.[0] || comment.user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">
                                {comment.user.full_name || comment.user.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{comment.text}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src={idea.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {idea.user.full_name?.[0] || idea.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {idea.user.full_name || idea.user.email}
                    </div>
                    <div className="text-sm text-muted-foreground">Creator</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{idea.collaborators} collaborators</span>
                </div>

                {idea.isCollaborator ? (
                  
                <Button variant="outline" className="w-full mt-2">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Team
                </Button>
                ): (<Button 
                  className="w-full"
                  onClick={handleColab}
                                  >
                  Join Idea
                </Button>)}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

