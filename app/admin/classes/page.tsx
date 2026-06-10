import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getClasses, searchClasses } from "@/lib/lms/queries/classes";

// 관리자 반 목록
export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const classes = q ? await searchClasses({ query: q }) : await getClasses();

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">반 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">반 목록과 소속 학생 수를 확인합니다.</p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/classes/new">반 추가</Link>
        </Button>
      </div>

      <Card className="mb-5 p-4">
        <form className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">반 이름 검색</label>
            <input
              name="q"
              defaultValue={q ?? ""}
              className="h-10 w-64 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
              placeholder="예: 고1 논술반"
            />
          </div>
          <Button type="submit" variant="ghost">적용</Button>
          {q ? (
            <Button asChild variant="ghost">
              <Link href="/admin/classes">초기화</Link>
            </Button>
          ) : null}
        </form>
      </Card>

      <h2 className="mb-4 text-sm font-semibold text-zinc-800">
        전체 반 목록 <span className="font-normal text-zinc-400">({classes.length}개)</span>
      </h2>
      {classes.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="text-sm text-zinc-400">
            {q ? "검색 조건에 맞는 반이 없습니다." : "아직 등록된 반이 없습니다. 반을 생성한 뒤 학생과 교사를 연결해 주세요."}
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {classes.map((cls) => (
            <li key={cls.id}>
              <Card className="transition hover:border-[var(--color-primary-200)]">
                <Link href={`/admin/classes/${cls.id}`} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{cls.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      담당: {cls.teacherName ?? "미배정"} · 학생 {cls.studentCount}명
                    </p>
                    {cls.description ? (
                      <p className="mt-1 text-xs text-zinc-500">{cls.description}</p>
                    ) : null}
                  </div>
                  <span className="text-xs font-medium text-blue-600">상세 보기 →</span>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
      </div>
  );
}
