"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";

export type ParentReportOption = {
  parentId: string;
  parentName: string;
  parentEmail: string;
  studentId: string;
  studentName: string;
  studentCreatedAt: string | null;
};

type ReportsClientProps = {
  status: string | null;
  selectedParentId: string;
  selectedParentName: string;
  selectedParentEmail: string;
  studentName: string;
  className: string;
  teacherName: string;
  monthDiff: number;
  parentOptions: ParentReportOption[];
  attendanceRate: number;
  attendanceCountLabel: string;
  submitRate: number;
  submitDelta: number;
  reviewedCount: number;
  growthScore: number | null;
  growthDelta: number;
  miniAlerts: string[];
  monthlyReportLines: string[];
  currentMonthLabel: string;
  onSendWeeklyAlert: (formData: FormData) => Promise<void>;
};

export default function ReportsClient({
  status,
  selectedParentId,
  selectedParentName,
  selectedParentEmail,
  studentName,
  className,
  teacherName,
  monthDiff,
  parentOptions,
  attendanceRate,
  attendanceCountLabel,
  submitRate,
  submitDelta,
  reviewedCount,
  growthScore,
  growthDelta,
  miniAlerts,
  monthlyReportLines,
  currentMonthLabel,
  onSendWeeklyAlert,
}: ReportsClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [alertDraft, setAlertDraft] = useState(miniAlerts);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const submitDeltaLabel = useMemo(() => {
    if (submitDelta > 0) return `↑ 지난달 +${submitDelta}%`;
    if (submitDelta < 0) return `↓ 지난달 ${submitDelta}%`;
    return "→ 지난달 +0%";
  }, [submitDelta]);

  const growthDeltaLabel = useMemo(() => {
    if (growthDelta > 0) return `↑ +${growthDelta}점`;
    if (growthDelta < 0) return `↓ ${growthDelta}점`;
    return "→ +0점";
  }, [growthDelta]);

  const handleConsult = () => {
    setToastMessage("상담 요청이 등록되었습니다.");
    window.setTimeout(() => setToastMessage(null), 2200);
  };

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          header, nav, [data-no-print] { display: none !important; }
          body { background: white !important; }
          .print-right-only { display: block !important; width: 100% !important; }
          .print-grid { display: block !important; }
        }
      `}</style>

      <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3" data-no-print>
        <h1 className="text-lg font-bold text-zinc-900">학부모 리포트</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="학생, 과제, 강의 검색..."
            className="h-9 w-56 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
          />
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500">
            ◻
          </button>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500">
            ⚙
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">학부모 리포트</h2>
          <p className="mt-1 text-sm text-zinc-500">주간 미니 알림 · 월간 종합 리포트 · 상담자료</p>
        </div>
        <div className="flex items-center gap-2" data-no-print>
          <form action={onSendWeeklyAlert}>
            <input type="hidden" name="parentId" value={selectedParentId} />
            <input type="hidden" name="parentEmail" value={selectedParentEmail} />
            <input type="hidden" name="studentName" value={studentName} />
            <button
              type="submit"
              className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              주간 알림 발송
            </button>
          </form>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            월간 PDF 출력
          </button>
        </div>
      </div>

      {status === "sent" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          주간 알림이 발송되었습니다. (이메일: {selectedParentEmail})
        </p>
      ) : null}
      {toastMessage ? (
        <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{toastMessage}</p>
      ) : null}

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {selectedParentName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{selectedParentName} 학부모님</p>
              <p className="mt-0.5 text-xs text-zinc-500">{className} · 담당: {teacherName}님 · 수강 {monthDiff}개월째</p>
            </div>
          </div>
          <div className="flex items-center gap-2" data-no-print>
            <select
              value={selectedParentId}
              onChange={(event) => router.push(`/admin/reports?parentId=${event.target.value}`)}
              className="h-9 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            >
              {parentOptions.map((option) => (
                <option key={option.parentId} value={option.parentId}>
                  {option.parentName} · {option.studentName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleConsult}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
            >
              상담 요청
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-zinc-500">이번달 출석</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">{attendanceRate}%</p>
          <p className="mt-1 text-xs text-emerald-600">{attendanceCountLabel}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500">과제 제출률</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">{submitRate}%</p>
          <p className="mt-1 text-xs text-emerald-600">{submitDeltaLabel}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500">첨삭 완료</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">{reviewedCount}건</p>
          <p className="mt-1 text-xs text-zinc-500">이번달</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500">종합 성장점수</p>
          <p className="mt-1 text-3xl font-bold text-indigo-700">{growthScore ?? "-"}</p>
          <p className="mt-1 text-xs text-emerald-600">{growthDeltaLabel}</p>
        </Card>
      </div>

      <div className="print-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4" data-no-print>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">이번 주 미니 알림 미리보기</h3>
            <button
              type="button"
              data-no-print
              onClick={() => {
                if (isEditing) {
                  setToastMessage("알림 문장이 저장되었습니다.");
                  window.setTimeout(() => setToastMessage(null), 1800);
                }
                setIsEditing((prev) => !prev);
              }}
              className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
            >
              {isEditing ? "저장" : "수정"}
            </button>
          </div>
          <div className="space-y-2">
            {alertDraft.map((line, index) => {
              const borderColor = index === 0 ? "border-emerald-500 bg-emerald-50" : index === 1 ? "border-indigo-500 bg-indigo-50" : "border-zinc-300 bg-zinc-50";
              return (
                <div key={index} className={`rounded-lg border-l-4 px-3 py-2 text-sm text-zinc-700 ${borderColor}`}>
                  {isEditing ? (
                    <textarea
                      value={line}
                      onChange={(event) => {
                        const next = [...alertDraft];
                        next[index] = event.target.value;
                        setAlertDraft(next);
                      }}
                      className="min-h-[64px] w-full resize-y rounded border border-zinc-200 bg-white p-2 text-sm outline-none focus:border-indigo-400"
                    />
                  ) : (
                    line
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="print-right-only p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">월간 종합 리포트 — {currentMonthLabel}</h3>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">강사 최종 검토 전</span>
          </div>
          <div className="space-y-2 text-sm text-zinc-700">
            {monthlyReportLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["출석", "과제 제출", "첨삭 완료", "리포트 발행"].map((chip) => (
              <span key={chip} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                {chip}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
