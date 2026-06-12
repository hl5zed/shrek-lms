import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedVideoUrl } from "@/lib/lectures/video-url";

// 관리자용 영상 URL 수정 API — 스트리밍 설정 화면에서 사용합니다
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  // 관리자 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 요청 본문 파싱
  const body = await request.json() as { id?: string; video_url?: string | null };
  const { id, video_url } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const nextVideoUrl = typeof video_url === "string" ? video_url.trim() : "";
  if (nextVideoUrl && !isAllowedVideoUrl(nextVideoUrl)) {
    return NextResponse.json({ error: "허용되지 않은 영상 URL입니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("lectures")
    .update({ video_url: video_url ?? null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
