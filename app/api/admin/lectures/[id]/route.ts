import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      supabase: null,
      userId: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      supabase: null,
      userId: user.id,
    };
  }

  return {
    ok: true as const,
    response: null,
    supabase,
    userId: user.id,
  };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await Promise.resolve(context.params);
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string | null;
    video_url?: string | null;
    material_url?: string | null;
  };

  const { error } = await auth.supabase
    .from("lectures")
    .update({
      title: body.title,
      description: body.description ?? null,
      video_url: body.video_url ?? null,
      material_url: body.material_url ?? null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await Promise.resolve(context.params);
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await auth.supabase.from("lectures").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
