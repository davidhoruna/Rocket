'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import type { Project, Idea } from '@/types/database'

export async function fetchProjects(userId?: string) {
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

export async function fetchIdeas(userId?: string) {
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