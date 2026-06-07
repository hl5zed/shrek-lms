import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Table, TableContainer } from "@/components/ui/Table";

// 관리자 학생 목록
export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("id, name, email, phone, created_at")
    .eq("role", "student")
    .order("name");

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">학생 목록</h1>
          <p className="mt-1 text-sm text-zinc-500">
            등록된 학생 <span className="font-semibold text-zinc-700">{students?.length ?? 0}</span>명
          </p>
        </div>
      </div>

      {!students || students.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">등록된 학생이 없습니다.</p>
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
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {students.map((s) => (
                <tr key={s.id} className="transition hover:bg-zinc-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {s.name?.charAt(0) ?? "?"}
                      </div>
                      <span className="font-medium text-zinc-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">{s.email}</td>
                  <td className="px-5 py-3.5 text-zinc-500">{s.phone ?? "—"}</td>
                  <td className="px-5 py-3.5 text-zinc-400">
                    {new Date(s.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-5 py-3.5">
                    <Button asChild variant="ghost" className="h-8 px-3 text-xs">
                      <Link href={`/admin/students/${s.id}`}>상세 보기</Link>
                    </Button>
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
