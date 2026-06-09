import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 강의 등록 — Server Action으로 lectures 테이블에 INSERT합니다.
export default async function NewLecturePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 강사가 담당하는 반 목록 조회
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", user!.id)
    .order("name");

  async function createLecture(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const videoUrl = formData.get("video_url") as string;
    const classId = formData.get("class_id") as string;

    // 생성 직전에도 class ownership(담당 반) 재검증을 수행합니다.
    const { data: ownedClass } = await supabase
      .from("classes")
      .select("id")
      .eq("id", classId)
      .eq("teacher_id", user.id)
      .maybeSingle();

    if (!ownedClass) {
      redirect("/teacher/lectures/new?status=forbidden");
    }

    await supabase.from("lectures").insert({
      title,
      description: description || null,
      video_url: videoUrl || null,
      class_id: classId,
      created_by: user.id,
    });

    redirect("/teacher/lectures");
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/teacher/lectures"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 강의 목록
      </Link>

      {/* 페이지 헤더 */}
      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">강의 등록</h1>
        <p className="mt-1 text-sm text-zinc-500">새 강의를 등록합니다.</p>
        {status === "forbidden" ? (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            담당 반이 아닌 곳에는 강의를 등록할 수 없습니다.
          </p>
        ) : null}
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
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
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
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">설명</label>
          <textarea
            name="description"
            rows={3}
            placeholder="강의 내용을 간략히 설명해 주세요."
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        {/* 영상 URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">영상 URL</label>
          <input
            type="url"
            name="video_url"
            placeholder="https://youtube.com/..."
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            등록하기
          </button>
          <Link
            href="/teacher/lectures"
            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
