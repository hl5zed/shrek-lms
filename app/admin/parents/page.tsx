import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Table, TableContainer } from "@/components/ui/Table";

// 관리자 학부모 목록 — 연결된 자녀 수 포함
export default async function AdminParentsPage() {
  const supabase = await createClient();

  const { data: parents } = await supabase
    .from("profiles")
    .select("id, name, email, phone, created_at")
    .eq("role", "parent")
    .order("name");

  // 학부모별 자녀 수 집계
  const { data: parentStudents } = await supabase
    .from("parent_students")
    .select("parent_id");

  const childCountMap = (parentStudents ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.parent_id] = (acc[r.parent_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">학부모 목록</h1>
        <p className="mt-1 text-sm text-zinc-500">
          등록된 학부모 <span className="font-semibold text-zinc-700">{parents?.length ?? 0}</span>명
        </p>
      </div>

      {!parents || parents.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">등록된 학부모가 없습니다.</p>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">이름</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">이메일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">자녀 수</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">등록일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {parents.map((p) => (
                <tr key={p.id} className="transition hover:bg-zinc-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                        {p.name?.charAt(0) ?? "?"}
                      </div>
                      <span className="font-medium text-zinc-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">{p.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone="neutral">{childCountMap[p.id] ?? 0}명</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400">
                    {new Date(p.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-5 py-3.5">
                    <Button asChild variant="ghost" className="h-8 px-3 text-xs">
                      <Link href={`/admin/parents/${p.id}`}>자녀 관리</Link>
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
