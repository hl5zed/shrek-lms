import { LmsMenuItem, LmsMenuKey } from "@/lib/lms/types";
import LogoutButton from "@/components/auth/LogoutButton";

type LmsTopbarProps = {
  activeMenu: LmsMenuKey;
  menus: LmsMenuItem[];
  onToggleMobileMenu: () => void;
};

export default function LmsTopbar({ activeMenu, menus, onToggleMobileMenu }: LmsTopbarProps) {
  const current = menus.find((m) => m.key === activeMenu);

  return (
    <header className="flex h-[var(--lms-topbar-h)] min-w-0 items-center gap-2 border-b border-[var(--color-neutral-200)] bg-white px-3 md:px-[18px]">
      <button
        type="button"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] lg:hidden"
        onClick={onToggleMobileMenu}
      >
        메뉴
      </button>
      <h2 className="min-w-0 flex-1 truncate text-[14px] font-bold text-[var(--color-neutral-1000)]">
        {current?.label ?? "대시보드"}
      </h2>
      <div className="hidden h-8 min-w-[200px] cursor-text items-center gap-1.5 rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-2.5 text-[11.5px] text-[var(--color-neutral-400)] md:flex lg:min-w-[220px]">
        학생, 과제, 강의 검색...
      </div>
      <button
        type="button"
        className="relative flex h-[30px] w-[30px] items-center justify-center rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]"
      >
        <span className="absolute right-1 top-1 h-[5px] w-[5px] rounded-full border border-white bg-[var(--lms-er)]" />
        알
      </button>
      <button
        type="button"
        className="flex h-[30px] w-[30px] items-center justify-center rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]"
      >
        계
      </button>
      <div className="lg:hidden">
        <LogoutButton className="px-2 py-1 text-xs" />
      </div>
    </header>
  );
}
