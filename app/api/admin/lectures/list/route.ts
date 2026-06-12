import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 관리자용 강의 목록 API — 스트리밍 설정 화면에서 사용합니다
export async function GET() {
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

  // 강의 + 반 이름 조회
  const { data: lectures, error } = await supabase
    .from("lectures")
    .select("id, title, video_url, created_at, classes ( name )")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (lectures ?? []).map((lec) => {
    const classInfo = lec.classes as { name?: string } | null;
    return {
      id: lec.id,
      title: lec.title?.trim() || "제목 없음",
      className: classInfo?.name?.trim() || "반 정보 없음",
      videoUrl: lec.video_url?.trim() || "",
      createdAtText: lec.created_at
        ? new Date(lec.created_at).toLocaleDateString("ko-KR")
        : "",
    };
  });

  return NextResponse.json({ rows });
}
