import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";

// 관리자 학생 추가 페이지 (profiles 직접 생성)
export default async function AdminStudentNewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  async function createStudent(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    if (!name || !email) {
      redirect("/admin/students/new?status=missing");
    }

    // profiles는 auth.users와 1:1이므로, 기존 인증 계정이 먼저 있어야 합니다.
    const { data: existing, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();

    if (profileError || !existing) {
      redirect("/admin/students/new?status=notfound");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        role: "student",
        name,
        phone: phone || null,
      })
      .eq("id", existing.id);

    if (error) {
      redirect("/admin/students/new?status=error");
    }

    redirect("/admin/students");
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/students" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        ← 학생 목록
      </Link>

      <Card className="max-w-xl p-6">
        <h1 className="text-xl font-bold text-zinc-900">학생 추가</h1>
        <p className="mt-1 text-sm text-zinc-500">기존 인증 계정의 프로필을 학생(role=student)으로 지정합니다.</p>

        {status === "notfound" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            해당 이메일의 인증 계정을 찾을 수 없습니다. 먼저 계정 생성 후 다시 시도하세요.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            저장 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.
          </p>
        ) : null}
        {status === "missing" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            이름과 이메일을 모두 입력해주세요.
          </p>
        ) : null}

        <form action={createStudent} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이름</label>
            <input
              name="name"
              required
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="학생 이름"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이메일</label>
            <input
              type="email"
              name="email"
              required
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="student@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">전화번호</label>
            <input
              name="phone"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="선택 입력"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button asChild variant="ghost">
              <Link href="/admin/students">취소</Link>
            </Button>
            <Button type="submit" variant="primary">등록</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
