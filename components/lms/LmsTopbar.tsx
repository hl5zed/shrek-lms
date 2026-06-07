import { LmsMenuItem, LmsMenuKey } from "@/lib/lms/types";

type LmsTopbarProps = {
  activeMenu: LmsMenuKey;
  menus: LmsMenuItem[];
};

export default function LmsTopbar({ activeMenu, menus }: LmsTopbarProps) {
  const current = menus.find((m) => m.key === activeMenu);

  return (
    <header className="flex h-[var(--lms-topbar-h)] items-center gap-2 border-b border-[var(--color-neutral-200)] bg-white px-[18px]">
      <h2 className="flex-1 text-[14px] font-bold text-[var(--color-neutral-1000)]">
        {current?.label ?? "대시보드"}
      </h2>
      <div className="flex h-8 min-w-[220px] cursor-text items-center gap-1.5 rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-2.5 text-[11.5px] text-[var(--color-neutral-400)]">
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
    </header>
  );
}
