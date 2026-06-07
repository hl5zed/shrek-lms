import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getClassById, getTeachersForClassForm, updateClass } from "@/lib/lms/queries/classes";

export default async function AdminClassEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const [cls, teachers] = await Promise.all([
    getClassById(id),
    getTeachersForClassForm(),
  ]);

  if (!cls) notFound();

  async function handleSave(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const teacherId = (formData.get("teacher_id") as string)?.trim();

    if (!name) {
      redirect(`/admin/classes/${id}/edit?status=missing`);
    }

    const result = await updateClass(id, {
      name,
      description: description || null,
      teacherId: teacherId || null,
    });

    if (!result.ok) {
      redirect(`/admin/classes/${id}/edit?status=error`);
    }

    redirect(`/admin/classes/${id}`);
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/classes/${id}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        ← 반 상세
      </Link>

      <Card className="max-w-xl p-6">
        <h1 className="text-xl font-bold text-zinc-900">반 정보 수정</h1>
        <p className="mt-1 text-sm text-zinc-500">현재 DB 컬럼(classes: name, description, teacher_id)만 수정합니다.</p>

        {status === "missing" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">반 이름은 필수입니다.</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">저장에 실패했습니다.</p>
        ) : null}

        <form action={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">반 이름</label>
            <input
              name="name"
              required
              defaultValue={cls.name}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">설명</label>
            <input
              name="description"
              defaultValue={cls.description ?? ""}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">담당 강사</label>
            <select
              name="teacher_id"
              defaultValue={cls.teacherId ?? ""}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            >
              <option value="">미배정</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button asChild variant="ghost">
              <Link href={`/admin/classes/${id}`}>취소</Link>
            </Button>
            <Button type="submit" variant="primary">저장</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
