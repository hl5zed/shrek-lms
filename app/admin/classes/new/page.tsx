import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClass, getTeachersForClassForm } from "@/lib/lms/queries/classes";

export default async function AdminClassNewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const teachers = await getTeachersForClassForm();

  async function handleCreateClass(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const teacherId = (formData.get("teacher_id") as string)?.trim();

    if (!name) {
      redirect("/admin/classes/new?status=missing");
    }

    const result = await createClass({
      name,
      description: description || null,
      teacherId: teacherId || null,
    });

    if (!result.ok) {
      redirect("/admin/classes/new?status=error");
    }

    redirect(`/admin/classes/${result.id}`);
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/classes" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        ← 반 목록
      </Link>

      <Card className="max-w-xl p-6">
        <h1 className="text-xl font-bold text-zinc-900">반 추가</h1>
        <p className="mt-1 text-sm text-zinc-500">현재 DB 컬럼(classes: name, description, teacher_id) 기준으로 생성합니다.</p>

        {status === "missing" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            반 이름은 필수입니다.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            반 생성에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : null}

        <form action={handleCreateClass} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">반 이름</label>
            <input
              name="name"
              required
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="예: 고1 논술반"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">설명</label>
            <input
              name="description"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="선택 입력"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">담당 강사</label>
            <select
              name="teacher_id"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              defaultValue=""
            >
              <option value="">미배정</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button asChild variant="ghost">
              <Link href="/admin/classes">취소</Link>
            </Button>
            <Button type="submit" variant="primary">생성</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
