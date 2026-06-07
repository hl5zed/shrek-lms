import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getStudentById, updateStudentProfile } from "@/lib/lms/queries/students";

export default async function AdminStudentEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const student = await getStudentById(id);

  if (!student) {
    redirect("/admin/students");
  }

  async function saveStudent(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    if (!name || !email) {
      redirect(`/admin/students/${id}/edit?status=missing`);
    }

    const result = await updateStudentProfile(id, {
      name,
      email,
      phone: phone || null,
    });

    if (!result.ok) {
      redirect(`/admin/students/${id}/edit?status=error`);
    }

    redirect(`/admin/students/${id}`);
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/students/${id}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        ← 학생 상세
      </Link>

      <Card className="max-w-xl p-6">
        <h1 className="text-xl font-bold text-zinc-900">학생 정보 수정</h1>
        <p className="mt-1 text-sm text-zinc-500">현재 DB 구조(`profiles`)에서 가능한 항목만 수정합니다.</p>

        {status === "missing" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            이름과 이메일은 필수입니다.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            저장에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : null}

        <form action={saveStudent} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이름</label>
            <input
              name="name"
              required
              defaultValue={student.name}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이메일</label>
            <input
              name="email"
              type="email"
              required
              defaultValue={student.email}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">전화번호</label>
            <input
              name="phone"
              defaultValue={student.phone ?? ""}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            역할: <b>{student.role}</b> · 가입일: {new Date(student.createdAt).toLocaleDateString("ko-KR")}
          </div>
          <div className="flex justify-end gap-2">
            <Button asChild variant="ghost">
              <Link href={`/admin/students/${id}`}>취소</Link>
            </Button>
            <Button type="submit" variant="primary">저장</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
