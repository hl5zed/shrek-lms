import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Table, TableContainer } from "@/components/ui/Table";
import { getStudents, searchStudents } from "@/lib/lms/queries/students";
import { createClient } from "@/lib/supabase/server";

// 관리자 학생 목록
export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string }>;
}) {
  const { q, classId } = await searchParams;
  const [students, classesResult] = await Promise.all([
    q || classId ? searchStudents({ query: q, classId }) : getStudents(),
    (async () => {
      const supabase = await createClient();
      return supabase.from("classes").select("id, name").order("name");
    })(),
  ]);
  const classes = classesResult.data ?? [];

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
        <Button asChild variant="primary">
          <Link href="/admin/students/new">학생 추가</Link>
        </Button>
      </div>

      <Card className="mb-4 p-4">
        <form className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">검색</label>
            <input
              name="q"
              defaultValue={q ?? ""}
              className="h-10 w-64 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="이름 또는 이메일"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">반 필터</label>
            <select
              name="classId"
              defaultValue={classId ?? ""}
              className="h-10 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            >
              <option value="">전체 반</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="ghost">적용</Button>
          {(q || classId) ? (
            <Button asChild variant="ghost">
              <Link href="/admin/students">초기화</Link>
            </Button>
          ) : null}
        </form>
      </Card>

      {!students || students.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">
            {q || classId ? "검색 조건에 맞는 학생이 없습니다." : "아직 등록된 학생이 없습니다. 학생 계정을 먼저 등록해 주세요."}
          </p>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">이름</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">이메일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">전화번호</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">수강반</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">학부모</th>
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
                  <td className="px-5 py-3.5 text-zinc-500">{s.classLabel}</td>
                  <td className="px-5 py-3.5 text-zinc-500">{s.parentCount}명</td>
                  <td className="px-5 py-3.5 text-zinc-400">
                    {new Date(s.createdAt).toLocaleDateString("ko-KR")}
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
