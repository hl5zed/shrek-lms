import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";

function makeTempPassword() {
  return Math.random().toString(36).slice(-8);
}

// 관리자 강사 추가 페이지 (service_role로 auth 계정을 생성하거나 기존 계정을 강사로 승격)
export default async function AdminTeacherNewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; temp?: string }>;
}) {
  const { status, temp } = await searchParams;

  async function createTeacher(formData: FormData) {
    "use server";
    try {
      assertAdminSupabaseEnv();
    } catch {
      redirect("/admin/teachers/new?status=error");
    }

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    if (!name || !email) {
      redirect("/admin/teachers/new?status=missing");
    }

    // 1) 기존 계정 여부 확인
    const { data: existing, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      redirect("/admin/teachers/new?status=error");
    }

    // 2) 기존 계정이 있으면 role만 teacher로 업데이트
    if (existing?.id) {
      const { error } = await adminSupabase
        .from("profiles")
        .update({
          role: "teacher",
          name,
          phone: phone || null,
        })
        .eq("id", existing.id);

      if (error) {
        redirect("/admin/teachers/new?status=error");
      }

      redirect("/admin/teachers/new?status=updated");
    }

    // 3) 기존 계정이 없으면 auth 계정 생성 후 profiles upsert
    const tempPassword = makeTempPassword();
    const { data: createdUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createUserError || !createdUser.user?.id) {
      redirect("/admin/teachers/new?status=error");
    }

    const { error: upsertError } = await adminSupabase.from("profiles").upsert({
      id: createdUser.user.id,
      role: "teacher",
      name,
      email,
      phone: phone || null,
    });

    if (upsertError) {
      redirect("/admin/teachers/new?status=error");
    }

    redirect(`/admin/teachers/new?status=created&temp=${encodeURIComponent(tempPassword)}`);
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/teachers" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        ← 강사 목록
      </Link>

      <Card className="max-w-xl p-6">
        <h1 className="text-xl font-bold text-zinc-900">강사 등록</h1>
        <p className="mt-1 text-sm text-zinc-500">기존 계정은 강사로 승격하고, 없으면 새 강사 계정을 생성합니다.</p>

        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            저장 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.
          </p>
        ) : null}
        {status === "updated" ? (
          <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            기존 계정의 권한을 강사로 변경했습니다.
          </p>
        ) : null}
        {status === "created" && temp ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            강사 계정이 생성되었습니다. 임시 비밀번호:{" "}
            <span className="font-semibold">{temp}</span> (강사에게 전달하고 변경하도록 안내하세요.)
          </p>
        ) : null}
        {status === "missing" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            이름과 이메일을 모두 입력해주세요.
          </p>
        ) : null}

        <form action={createTeacher} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이름</label>
            <input
              name="name"
              required
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="강사 이름"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이메일</label>
            <input
              type="email"
              name="email"
              required
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="teacher@example.com"
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
              <Link href="/admin/teachers">취소</Link>
            </Button>
            <Button type="submit" variant="primary">등록</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
