import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { data: project } = await supabase.from("projects").select("id").eq("id", params.id).single()

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("project_id", project.id)
      .single()

    if (existingLike) {
      await supabase.from("likes").delete().eq("id", existingLike.id)

      return NextResponse.json({ liked: false })
    }

    await supabase.from("likes").insert({
      user_id: user.id,
      project_id: project.id,
    })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

