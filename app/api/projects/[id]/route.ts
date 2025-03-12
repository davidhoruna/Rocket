import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        *,
        user:user_id (
          id,
          name,
          image
        ),
        comments (
          *,
          user (
            id,
            name,
            image
          )
        ),
        likes_count:likes(count)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      throw error
    }

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    const currentUser = await getCurrentUser()
    let isLiked = false

    if (currentUser) {
      const { data: like } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("project_id", project.id)
        .single()

      isLiked = !!like
    }

    // Get similar projects
    const { data: similarProjects } = await supabase
      .from("projects")
      .select("id, title, image, industry, field")
      .or(`industry.eq.${project.industry},field.eq.${project.field}`)
      .neq("id", project.id)
      .limit(3)

    return NextResponse.json({
      ...project,
      isLiked,
      similarProjects,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

