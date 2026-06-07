import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

// 관리자 반 목록 + 반 생성
export default async function AdminClassesPage() {
  const supabase = await createClient();

  const [{ data: classes }, { data: teachers }] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name, description, created_at, profiles!teacher_id ( name )")
      .order("name"),
    supabase.from("profiles").select("id, name").eq("role", "teacher").order("name"),
  ]);

  async function createClass(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const teacherId = formData.get("teacher_id") as string;

    await supabase.from("classes").insert({
      name,
      description: description || null,
      teacher_id: teacherId || null,
    });
    redirect("/admin/classes");
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">반 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">반을 생성하고 담당 강사를 배정합니다.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 반 생성 폼 */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <form action={createClass}>
            <h2 className="mb-4 text-sm font-semibold text-zinc-800">새 반 만들기</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600">반 이름 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="예: 고1 논술반"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600">설명</label>
                <input
                  type="text"
                  name="description"
                  placeholder="선택 사항"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600">담당 강사</label>
                <select
                  name="teacher_id"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                >
                  <option value="">선택 안 함</option>
                  {(teachers ?? []).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="primary" className="w-full">
                반 만들기
              </Button>
            </div>
            </form>
          </Card>
        </div>

        {/* 반 목록 */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">
            전체 반 목록{" "}
            <span className="font-normal text-zinc-400">({classes?.length ?? 0}개)</span>
          </h2>
          {!classes || classes.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <p className="text-sm text-zinc-400">등록된 반이 없습니다.</p>
            </Card>
          ) : (
            <ul className="space-y-2">
              {classes.map((cls) => (
                <li key={cls.id}>
                  <Card className="transition hover:border-[var(--color-primary-200)]">
                    <Link
                      href={`/admin/classes/${cls.id}`}
                      className="flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{cls.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          담당: {(cls.profiles as unknown as { name: string } | null)?.name ?? "미배정"}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-blue-600">상세 보기 →</span>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
