import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Table, TableContainer } from "@/components/ui/Table";
import Link from "next/link";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import DeleteTeacherButton from "@/components/admin/DeleteTeacherButton";

// 관리자 강사 목록
export default async function AdminTeachersPage() {
  assertAdminSupabaseEnv();

  async function deleteTeacher(formData: FormData) {
    "use server";
    assertAdminSupabaseEnv();
    const teacherId = formData.get("teacherId") as string;
    if (!teacherId) return;
    try {
      await adminSupabase.auth.admin.deleteUser(teacherId);
    } catch {
      try {
        await adminSupabase.from("profiles").delete().eq("id", teacherId);
      } catch { /* 에러 무시 */ }
    }
    revalidatePath("/admin/teachers");
    redirect("/admin/teachers");
  }

  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id, name, email, phone, created_at")
    .eq("role", "teacher")
    .order("name");

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">강사 목록</h1>
          <p className="mt-1 text-sm text-zinc-500">
            등록된 강사 <span className="font-semibold text-zinc-700">{teachers?.length ?? 0}</span>명
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/teachers/new">강사 등록</Link>
        </Button>
      </div>

      {!teachers || teachers.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">아직 등록된 강사가 없습니다. 강사 계정을 먼저 등록해 주세요.</p>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">이름</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">이메일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">전화번호</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">등록일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {teachers.map((t) => (
                <tr key={t.id} className="transition hover:bg-zinc-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                        {t.name?.charAt(0) ?? "?"}
                      </div>
                      <span className="font-medium text-zinc-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">{t.email}</td>
                  <td className="px-5 py-3.5 text-zinc-500">{t.phone ?? "—"}</td>
                  <td className="px-5 py-3.5 text-zinc-400">
                    {new Date(t.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-5 py-3.5">
                    <DeleteTeacherButton
                      action={deleteTeacher}
                      teacherId={t.id}
                      teacherName={t.name ?? "강사"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
