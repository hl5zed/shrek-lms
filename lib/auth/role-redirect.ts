// profiles.role 기준으로 역할별 기본 이동 경로를 관리합니다.
export const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
};

export function getHomeByRole(role: string | null | undefined): string | null {
  if (!role) return null;
  return ROLE_HOME[role] ?? null;
}

