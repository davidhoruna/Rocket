import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import type { Project, Idea, ProjectLike, IdeaLightbulb } from '@/types/database'

export async function getProjects(userId?: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  let query = supabase
    .from('projects')
    .select(`
      *,
      likes:project_likes(count),
      collaborators:project_collaborators(count),
      user_liked:project_likes!inner(user_id)
    `)
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_liked.user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data.map(project => ({
    ...project,
    likes: project.likes[0]?.count || 0,
    collaborators: project.collaborators[0]?.count || 0,
    isLiked: !!project.user_liked?.length
  }))
}

export async function getIdeas(userId?: string) {

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  let query = supabase
    .from('ideas')
    .select(`
      *,
      lightbulbs:idea_lightbulbs(count),
      user_lightbulbed:idea_lightbulbs!inner(user_id)
    `)
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_lightbulbed.user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return []
  }

  return data.map(idea => ({
    ...idea,
    lightbulbs: idea.lightbulbs[0]?.count || 0,
    isLightbulbed: !!idea.user_lightbulbed?.length
  }))
}

export async function createProject(project: Omit<Project, 'id' | 'created_at'>) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
    
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createIdea(idea: Omit<Idea, 'id' | 'created_at'>) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
    
  const { data, error } = await supabase
    .from('ideas')
    .insert(idea)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function toggleProjectLike(projectId: string, userId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
    
  const { data: existingLike } = await supabase
    .from('project_likes')
    .select()
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    await supabase
      .from('project_likes')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)
  } else {
    await supabase
      .from('project_likes')
      .insert({ project_id: projectId, user_id: userId })
  }
}

export async function toggleIdeaLightbulb(ideaId: string, userId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
    
  const { data: existingLightbulb } = await supabase
    .from('idea_lightbulbs')
    .select()
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .single()

  if (existingLightbulb) {
    await supabase
      .from('idea_lightbulbs')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
  } else {
    await supabase
      .from('idea_lightbulbs')
      .insert({ idea_id: ideaId, user_id: userId })
  }
} 