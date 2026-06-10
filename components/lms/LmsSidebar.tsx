import { LmsMenuItem, LmsMenuKey } from "@/lib/lms/types";
import LogoutButton from "@/components/auth/LogoutButton";

type LmsSidebarProps = {
  menus: LmsMenuItem[];
  activeMenu: LmsMenuKey;
  onChangeMenu: (menu: LmsMenuKey) => void;
  className?: string;
};

export default function LmsSidebar({ menus, activeMenu, onChangeMenu, className = "" }: LmsSidebarProps) {
  const groups: Array<"운영 관리" | "강의 콘텐츠" | "첨삭 & 성장" | "기타"> = [
    "운영 관리",
    "강의 콘텐츠",
    "첨삭 & 성장",
    "기타",
  ];

  const badgeClass = {
    primary: "bg-[var(--lms-br)] text-white",
    warning: "bg-[var(--lms-wa)] text-[#6b4800]",
    danger: "bg-[var(--lms-er)] text-white",
  };

  return (
    <aside className={`flex h-full min-h-0 flex-col border-r border-[var(--color-neutral-200)] bg-white ${className || "w-[var(--lms-sidebar-w)]"}`}>
      <div className="border-b border-[var(--color-neutral-200)] px-[14px] pb-3 pt-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--lms-r)] bg-[var(--lms-br)] text-[13px] font-bold text-white">
            S
          </div>
          <div>
            <p className="text-[13px] font-bold text-[var(--color-neutral-1000)]">슈렉샘 논술 LMS</p>
            <p className="text-[10px] text-[var(--color-neutral-400)]">논술 성장관리 플랫폼</p>
          </div>
        </div>
      </div>

      <nav className="lms-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {groups.map((group) => (
          <div key={group} className="mb-0.5 px-0">
            <p className="px-2 pb-1 pt-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--color-neutral-400)]">
              {group}
            </p>
            <div className="space-y-0.5">
              {menus
                .filter((menu) => menu.group === group)
                .map((menu) => {
                  const isActive = activeMenu === menu.key;
                  return (
                    <button
                      key={menu.key}
                      type="button"
                      onClick={() => onChangeMenu(menu.key)}
                      className={`flex w-full items-center gap-1.5 rounded-[var(--lms-r)] px-2 py-1.5 text-left text-[12.5px] transition ${
                        isActive
                          ? "bg-[var(--lms-br-l)] font-bold text-[var(--lms-br)]"
                          : "text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
                      }`}
                    >
                      <span className="truncate">{menu.label}</span>
                      {menu.badge ? (
                        <span
                          className={`ml-auto rounded-full px-1.5 py-[1px] text-[9px] font-bold ${badgeClass[menu.badge.tone]}`}
                        >
                          {menu.badge.text}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--color-neutral-200)] px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--lms-br-l)] text-[11px] font-bold text-[var(--lms-br)]">
            관
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--color-neutral-1000)]">관리자</p>
            <p className="text-[10px] text-[var(--color-neutral-400)]">최고관리자</p>
          </div>
        </div>
        <LogoutButton variant="sidebar" className="mt-2" />
      </div>
    </aside>
  );
}
