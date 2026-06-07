import { redirect } from "next/navigation";

// 관리자 루트 접근 시 대시보드로 보냅니다.
// 인증/권한 검증은 app/admin/layout.tsx에서 그대로 처리됩니다.
export default function AdminRootPage() {
  redirect("/admin/dashboard");
}
