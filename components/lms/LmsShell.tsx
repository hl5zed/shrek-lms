"use client";

import { useEffect, useMemo, useState } from "react";
import { lmsMockData } from "@/lib/lms/mock-data";
import { LmsMenuKey } from "@/lib/lms/types";
import LmsSidebar from "./LmsSidebar";
import LmsTopbar from "./LmsTopbar";
import DashboardPanel from "./panels/DashboardPanel";
import StudentsPanel from "./panels/StudentsPanel";
import ClassRecordsPanel from "./panels/ClassRecordsPanel";
import LessonsPanel from "./panels/LessonsPanel";
import AssignmentsPanel from "./panels/AssignmentsPanel";
import SubmitPanel from "./panels/SubmitPanel";
import FeedbackPanel from "./panels/FeedbackPanel";
import GrowthPanel from "./panels/GrowthPanel";
import PortfolioPanel from "./panels/PortfolioPanel";
import ParentReportPanel from "./panels/ParentReportPanel";
import BoardPanel from "./panels/BoardPanel";
import SettingsPanel from "./panels/SettingsPanel";

type LmsShellProps = {
  initialMenu?: LmsMenuKey;
  fullscreen?: boolean;
};

export default function LmsShell({ initialMenu = "dashboard", fullscreen = false }: LmsShellProps) {
  const [activeMenu, setActiveMenu] = useState<LmsMenuKey>(initialMenu);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const data = lmsMockData;

  useEffect(() => {
    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const panel = useMemo(() => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardPanel data={data} />;
      case "students":
        return <StudentsPanel data={data} />;
      case "class-records":
        return <ClassRecordsPanel data={data} />;
      case "lessons":
        return <LessonsPanel data={data} />;
      case "assignments":
        return <AssignmentsPanel data={data} />;
      case "submit":
        return <SubmitPanel data={data} />;
      case "feedback":
        return <FeedbackPanel data={data} />;
      case "growth":
        return <GrowthPanel data={data} />;
      case "portfolio":
        return <PortfolioPanel data={data} />;
      case "parent-report":
        return <ParentReportPanel data={data} />;
      case "board":
        return <BoardPanel data={data} />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <DashboardPanel data={data} />;
    }
  }, [activeMenu, data]);

  return (
    <div
      className={`overflow-hidden bg-[var(--color-neutral-50)] ${
        fullscreen
          ? "min-h-screen w-full overflow-x-hidden rounded-none border-0"
          : "rounded-[var(--lms-rx)] border border-[var(--color-neutral-200)]"
      }`}
    >
      <div className={`flex ${fullscreen ? "min-h-screen" : "h-[760px]"}`}>
        <div className="hidden lg:flex">
          <LmsSidebar
            menus={data.menus}
            activeMenu={activeMenu}
            onChangeMenu={setActiveMenu}
            className="h-full w-[192px] shrink-0"
          />
        </div>

        {mobileMenuOpen ? (
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        ) : null}
        <div
          className={`fixed bottom-0 left-0 top-0 z-50 w-[260px] max-w-[85vw] lg:hidden transition-transform ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <LmsSidebar
            menus={data.menus}
            activeMenu={activeMenu}
            onChangeMenu={(menu) => {
              setActiveMenu(menu);
              setMobileMenuOpen(false);
            }}
            className="h-full w-full"
          />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[var(--color-neutral-50)]">
          <LmsTopbar
            activeMenu={activeMenu}
            menus={data.menus}
            onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          />
          <div
            className={`lms-scrollbar min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-4 lg:p-[var(--lms-content-p)] ${
              fullscreen
                ? "h-[calc(100vh-var(--lms-topbar-h))]"
                : "h-[calc(760px-var(--lms-topbar-h))]"
            }`}
          >
            {panel}
          </div>
        </div>
      </div>
    </div>
  );
}
