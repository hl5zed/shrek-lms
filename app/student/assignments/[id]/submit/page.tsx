import { redirect } from "next/navigation";

// 제출 흐름은 과제 상세(page.tsx + actions.ts)로 통합되어 submit 라우트는 상세로 전달합니다.
export default async function SubmitAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/student/assignments/${id}`);
}
