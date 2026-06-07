import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LmsBadge from "@/components/lms/LmsBadge";
import { LmsMockData } from "@/lib/lms/types";

type BoardPanelProps = {
  data: LmsMockData;
};

export default function BoardPanel({ data }: BoardPanelProps) {
  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary">새 글 작성</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-neutral-50)]">
            <tr className="border-b border-[var(--color-neutral-200)]">
              <th className="px-4 py-3 text-left">제목</th>
              <th className="px-4 py-3 text-left">대상</th>
              <th className="px-4 py-3 text-left">작성일</th>
              <th className="px-4 py-3 text-left">공개상태</th>
            </tr>
          </thead>
          <tbody>
            {data.board.map((post) => (
              <tr key={post.id} className="border-b border-[var(--color-neutral-100)]">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">{post.target}</td>
                <td className="px-4 py-3">{post.createdAt}</td>
                <td className="px-4 py-3">
                  <LmsBadge tone={post.visibility === "공개" ? "success" : "neutral"}>{post.visibility}</LmsBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
