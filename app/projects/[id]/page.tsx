"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Share2, Github, Twitter, Instagram, Linkedin, MessageSquare, Users, Tag, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProjectHeader } from "@/components/project-header"
import { createClient } from '@/utils/supabase/client'
import type { Project, Idea } from '@/types/database'

type ProjectWithDetails = Project & {
  likes: number;
  collaborators: number;
  isLiked: boolean;
  isCollaborator?: boolean;
  user: {
    id: string;
    email: string;
    username?: string;
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


export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<ProjectWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      // First get the project details
      const { data: project, error: projectError } = await supabase
  .from("projects")
  .select(`
    *,
    user:profiles!projects_user_id_fkey(id, email, full_name, avatar_url)
  `)
  .eq("id", params.id)
  .single();

      if (projectError) {
        console.error('Error fetching project:', projectError)
        return
      }

      // Then get likes count and user's like status
      const { data: likes } = await supabase
        .from('project_likes')
        .select('user_id')
        .eq('project_id', params.id)

      // Get collaborators count
      const { data: collaborators } = await supabase
        .from('project_collaborators')
        .select('user_id')
        .eq('project_id', params.id)

      // Get comments with user details
      const { data: comments } = await supabase
        .from('project_comments')
        .select(`
          id,
          text,
          created_at,
          user:profiles!project_comments_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('project_id', params.id)
        .order('created_at', { ascending: false })

      setProject({
        ...project,
        likes: likes?.length || 0,
        collaborators: collaborators?.length || 0,
        isLiked: likes?.some(like => like.user_id === session?.user?.id) || false,
        isCollaborator: collaborators?.some(collaborator => collaborator.user_id === session?.user?.id) || false,
        comments: comments || [],
      })
      setLoading(false)
    }
    console.log("Fetching project with ID:", params.id);

    fetchProject()
  }, [params.id])

  const handleLike = async () => {
    if (!project) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('project_likes')
      .upsert(
        { project_id: project.id, user_id: session.user.id },
        { onConflict: 'project_id,user_id' }
      )

    if (error) {
      console.error('Error liking project:', error)
      return
    } 

    setProject(prev => prev ? {
      ...prev,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      isLiked: !prev.isLiked
    } : null)
  }

  
  const handleComment = async () => {
    if (!comment.trim() || !project) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    setSubmittingComment(true)

    const { data: newComment, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: project.id,
        user_id: session.user.id,
        text: comment.trim()
      })
      .select(`
        id,
        text,
        created_at,
        user:profiles!project_comments_user_id_fkey(id, full_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error posting comment:', error)
    } else if (newComment) {
      setProject(prev => prev ? {
        ...prev,
        comments: [newComment, ...prev.comments]
      } : null)
      setComment("")
    }

    setSubmittingComment(false)
  }

  const handleColab = async () => {
    if (!project) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('project_collaborators')
      .upsert(
        { project_id: project.id, user_id: session.user.id },
        { onConflict: 'project_id,user_id' }
      )

    if (error) {
      console.error('Error joining project:', error)
      return
    } 

    setProject(prev => prev ? {
      ...prev,
      colabs: prev.isCollaborator ? prev.collaborators : prev.collaborators + 1,
    } : null)    
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/projects">
            <Button>Back to Projects</Button>
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
          <Link href="/projects" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">


            <div>
              <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
              <p className="text-muted-foreground whitespace-pre-line">{project.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="bg-secondary text-foreground border-border">
                {project.industry}
              </Badge>
              <Badge variant="outline" className="bg-secondary text-foreground border-border">
                {project.field}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 ${project.isLiked ? "bg-red-900/20 border-red-500 text-red-500" : "border-border"}`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${project.isLiked ? "fill-red-500" : ""}`} />
                  <span>{project.likes}</span>
                </Button>

                <Button variant="outline" size="sm" className="flex items-center gap-2 border-border">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Posted on {new Date(project.created_at).toLocaleDateString()}
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
                {project.comments.length > 0 ? (
                  project.comments.map((comment) => (
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
                    <AvatarImage src={project.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {project.user.full_name?.[0] || project.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {project.user.full_name || project.user.email}
                    </div>
                    <div className="text-sm text-muted-foreground">Creator</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.collaborators} collaborators</span>
                </div>

                
                {project.isCollaborator ? (
                  <Button variant="outline" className="w-full mt-2">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Team
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleColab}>
                  Join Project
                  </Button>
                )}
              </CardContent>
            </Card>

            {(project.github_url || project.twitter_url || project.instagram_url || project.linkedin_url) && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Project Links</h3>
                  <div className="space-y-3">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                      >
                        <Github className="h-5 w-5" />
                        <span>GitHub Repository</span>
                      </a>
                    )}
                    {project.twitter_url && (
                      <a
                        href={project.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                      >
                        <Twitter className="h-5 w-5" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {project.instagram_url && (
                      <a
                        href={project.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                      >
                        <Instagram className="h-5 w-5" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {project.linkedin_url && (
                      <a
                        href={project.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
  </div>
  )
}

