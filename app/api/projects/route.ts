import { NextResponse } from "next/server"
import supabase from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get("industry")
    const field = searchParams.get("field")
    const difficulty = searchParams.get("difficulty")
    const privacy = searchParams.get("privacy")
    const search = searchParams.get("search")

    let query = supabase.from("projects").select(`
        *,
        user:user_id (*),
        likes:likes(count),
        comments:comments(count)
      `)

    if (industry) {
      query = query.eq("industry", industry)
    }

    if (field) {
      query = query.eq("field", field)
    }

    if (difficulty) {
      query = query.lte("difficulty", Number.parseInt(difficulty))
    }

    if (privacy) {
      query = query.eq("privacy", privacy)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: projects, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // Check if projects are liked by current user
    let projectsWithLikeStatus = projects

    if (userId) {
      const { data: likes } = await supabase.from("likes").select("project_id").eq("user_id", userId)

      const likedProjectIds = new Set(likes?.map((like) => like.project_id))

      projectsWithLikeStatus = projects.map((project) => ({
        ...project,
        isLiked: likedProjectIds.has(project.id),
      }))
    }

    return NextResponse.json(projectsWithLikeStatus)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, description, image, industry, field, difficulty, privacy, github, twitter, instagram, linkedin } =
      await request.json()

    if (!title || !description || !industry || !field || !difficulty || !privacy) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        title,
        description,
        image,
        industry,
        field,
        difficulty: Number.parseInt(difficulty),
        privacy,
        github,
        twitter,
        instagram,
        linkedin,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

