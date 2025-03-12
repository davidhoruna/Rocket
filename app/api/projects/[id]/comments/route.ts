import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ message: "Comment text is required" }, { status: 400 })
    }

    const { data: project } = await supabase.from("projects").select("id").eq("id", params.id).single()

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        text,
        user_id: user.id,
        project_id: project.id,
      })
      .select(`
        *,
        user (
          id,
          name,
          image
        )
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

