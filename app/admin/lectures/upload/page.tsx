import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AudioUploadField from "@/components/lecture/AudioUploadField";

// 관리자 콘텐츠 업로드 — 담당 반 제한 없이 모든 반에 강의를 등록합니다
export default async function AdminLectureUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  // 관리자 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/admin");

  // 전체 반 목록 조회 (관리자는 모든 반 접근 가능)
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .order("name");

  // 강의 등록 Server Action
  async function createLecture(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const videoUrl = (formData.get("video_url") as string)?.trim();
    const materialUrl = (formData.get("material_url") as string)?.trim();
    const audioUrl = (formData.get("audio_url") as string)?.trim();
    const classId = (formData.get("class_id") as string)?.trim();

    if (!title || !classId) {
      redirect("/admin/lectures/upload?status=invalid");
    }

    // 관리자 권한 재검증
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      redirect("/admin/lectures/upload?status=forbidden");
    }

    await supabase.from("lectures").insert({
      title,
      description: description || null,
      video_url: videoUrl || null,
      material_url: materialUrl || null,
      audio_url: audioUrl || null,
      class_id: classId,
      created_by: user.id,
    });

    redirect("/admin/lectures?status=uploaded");
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/admin/lectures"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 강의 콘텐츠 관리
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">콘텐츠 업로드</h1>
        <p className="mt-1 text-sm text-zinc-500">새 강의를 등록합니다. 영상 URL 또는 자료 파일 URL 중 하나 이상 입력하세요.</p>

        {/* 상태 메시지 */}
        {status === "forbidden" && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            관리자 권한이 없습니다.
          </p>
        )}
        {status === "invalid" && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            강의 제목과 대상 반은 필수 항목입니다.
          </p>
        )}
      </div>

      <form action={createLecture} className="max-w-xl space-y-5">
        {/* 반 선택 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            대상 반 <span className="text-red-500">*</span>
          </label>
          <select
            name="class_id"
            required
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
          >
            <option value="">반을 선택하세요</option>
            {(classes ?? []).map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* 강의 제목 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            강의 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="예: 1강 논증의 기초"
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">설명</label>
          <textarea
            name="description"
            rows={3}
            placeholder="강의 내용을 간략히 설명해 주세요."
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
          />
        </div>

        {/* 영상 URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">영상 URL</label>
          <input
            type="url"
            name="video_url"
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
          />
          <p className="mt-1 text-xs text-zinc-400">YouTube · Vimeo · Bunny Stream URL을 지원합니다.</p>
        </div>

        {/* 자료 파일 URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">자료 파일 URL</label>
          <input
            type="url"
            name="material_url"
            placeholder="https://... (PDF 또는 Supabase Storage URL)"
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
          />
          <p className="mt-1 text-xs text-zinc-400">Supabase Storage URL 또는 외부 PDF 링크를 입력하세요.</p>
        </div>

        <AudioUploadField />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            등록하기
          </button>
          <Link
            href="/admin/lectures"
            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
