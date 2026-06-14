import { IconBell, IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import StudentLogoutButton from "./StudentLogoutButton";

type StudentHeaderProps = {
  title: string;
  backHref?: string;
  studentName?: string;
  studentEmail?: string;
  showGreeting?: boolean;
  notificationCount?: number;
};

export default function StudentHeader({
  title,
  backHref,
  studentName = "학생",
  studentEmail = "",
  showGreeting = false,
  notificationCount = 0,
}: StudentHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#EAEDFA] bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {backHref ? (
              <Link href={backHref} className="rounded-md p-1 text-[#4A55A8] hover:bg-[#F5F7FF]">
                <IconChevronLeft size={18} />
              </Link>
            ) : null}
            {showGreeting ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#06091F]">
                  안녕하세요, {studentName}님
                </p>
                {studentEmail ? (
                  <p className="truncate text-[11px] text-[#6470BF]">{studentEmail}</p>
                ) : null}
              </div>
            ) : (
              <h1 className="truncate text-sm font-semibold text-[#06091F]">{title}</h1>
            )}
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="relative rounded-md p-1 text-[#4A55A8] hover:bg-[#F5F7FF]"
            >
              <IconBell size={18} />
              {notificationCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold leading-none text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
            <StudentLogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}

