import LmsShell from "@/components/lms/LmsShell";

// 관리자 대시보드 — 인증/역할 검증은 app/admin/layout.tsx 에서 처리합니다.
export default async function AdminDashboardPage() {
  return (
    <LmsShell initialMenu="dashboard" fullscreen />
  );
}
