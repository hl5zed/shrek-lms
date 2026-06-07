import AuthLogoutButton from "@/components/auth/LogoutButton";

// 기존 레이아웃 사이드바 호환용 래퍼 컴포넌트입니다.
export default function LogoutButton() {
  return <AuthLogoutButton variant="sidebar" />;
}
