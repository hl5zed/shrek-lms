"use client";

import { useMemo, useState } from "react";
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
  selectedStudentId: string;
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
  onSaveAlertDraft: (formData: FormData) => Promise<void>;
};

export default function ReportsClient({
  status,
  selectedParentId,
  selectedStudentId,
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
  onSaveAlertDraft,
}: ReportsClientProps) {
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
      <div className="print-only-header hidden border-b-2 border-zinc-200 pb-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">슈렉샘 LMS &nbsp;·&nbsp; 논술 성장관리 플랫폼</span>
          <span className="text-[11px] font-semibold text-zinc-500">월간 종합 리포트 &nbsp;·&nbsp; {currentMonthLabel}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10.5px] text-zinc-600">
            {selectedParentName} 학부모님&nbsp;·&nbsp;{studentName}&nbsp;·&nbsp;{className}&nbsp;·&nbsp;담당: {teacherName}님&nbsp;·&nbsp;수강 {monthDiff}개월째
          </span>
          <span className="text-[10.5px] text-zinc-500 tabular-nums">
            출석 {attendanceRate}%&nbsp;&nbsp;|&nbsp;&nbsp;과제 제출률 {submitRate}%&nbsp;&nbsp;|&nbsp;&nbsp;첨삭 완료 {reviewedCount}건&nbsp;&nbsp;|&nbsp;&nbsp;성장점수 {growthScore ?? "−"}점
          </span>
        </div>
      </div>
      <style>{`
        @media print {
          aside, header, nav, [data-no-print] { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          .print-right-only { display: block !important; width: 100% !important; }
          .print-grid { display: block !important; }
          .print-only-header { display: block !important; }

          /* 페이지 여백 및 자동 페이지 넘김 */
          @page { margin: 16mm 14mm; size: A4 portrait; }

          /* 카드·섹션이 페이지 중간에서 잘리지 않도록 */
          .space-y-4 > * { break-inside: avoid; }
          .grid > * { break-inside: avoid; }
          .rounded-xl { break-inside: avoid; }

          /* 월간 리포트 카드는 항상 앞쪽에 표시 */
          .print-right-only { break-before: auto; break-after: auto; }
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
            {alertDraft.map((line, i) => (
              <input key={i} type="hidden" name="alertLine" value={line} />
            ))}
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
      {status === "draft_saved" ? (
        <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          미니 알림 문장이 저장되었습니다. 다음 주간 알림 발송 시 반영됩니다.
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
              value={`${selectedParentId}__${selectedStudentId}`}
              onChange={(event) => {
                const [pId, sId] = event.target.value.split("__");
                window.location.href = `/admin/reports?parentId=${pId}&studentId=${sId}`;
              }}
              className="h-9 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            >
              {parentOptions.map((option) => (
                <option key={`${option.parentId}-${option.studentId}`} value={`${option.parentId}__${option.studentId}`}>
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

      <Card className="p-3">
        <div className="grid grid-cols-4 divide-x divide-zinc-100">
          <div className="px-4 py-1 text-center first:pl-2 last:pr-2">
            <p className="text-[10px] font-medium text-zinc-400">이번달 출석</p>
            <p className="mt-0.5 text-xl font-bold text-zinc-900">{attendanceRate}%</p>
            <p className="mt-0.5 text-[10px] text-zinc-400">{attendanceCountLabel}</p>
          </div>
          <div className="px-4 py-1 text-center">
            <p className="text-[10px] font-medium text-zinc-400">과제 제출률</p>
            <p className="mt-0.5 text-xl font-bold text-zinc-900">{submitRate}%</p>
            <p className="mt-0.5 text-[10px] text-emerald-600">{submitDeltaLabel}</p>
          </div>
          <div className="px-4 py-1 text-center">
            <p className="text-[10px] font-medium text-zinc-400">첨삭 완료</p>
            <p className="mt-0.5 text-xl font-bold text-zinc-900">{reviewedCount}건</p>
            <p className="mt-0.5 text-[10px] text-zinc-400">이번달</p>
          </div>
          <div className="px-4 py-1 text-center last:pr-2">
            <p className="text-[10px] font-medium text-indigo-400">종합 성장점수</p>
            <p className="mt-0.5 text-xl font-bold text-indigo-700">{growthScore ?? "−"}</p>
            <p className="mt-0.5 text-[10px] text-emerald-600">{growthDeltaLabel}</p>
          </div>
        </div>
      </Card>

      <div className="print-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4" data-no-print>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">이번 주 미니 알림 미리보기</h3>
            {isEditing ? (
              <form
                action={onSaveAlertDraft}
                data-no-print
              >
                <input type="hidden" name="parentId" value={selectedParentId} />
                {alertDraft.map((line, i) => (
                  <input key={i} type="hidden" name="alertLine" value={line} />
                ))}
                <button
                  type="submit"
                  className="rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-100"
                >
                  저장
                </button>
              </form>
            ) : (
              <button
                type="button"
                data-no-print
                onClick={() => setIsEditing(true)}
                className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
              >
                수정
              </button>
            )}
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

        <Card className="print-right-only p-5">
          {/* 헤더 */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">월간 종합 리포트</p>
              <p className="mt-0.5 text-base font-bold text-zinc-900">{currentMonthLabel}</p>
            </div>
            <span className="mt-0.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-600">
              강사 최종 검토 전
            </span>
          </div>

          {/* 지표 2×2 그리드 */}
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] font-medium text-zinc-400">이번달 출석률</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{attendanceRate}%</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">{attendanceCountLabel}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] font-medium text-zinc-400">과제 제출률</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{submitRate}%</p>
              <p className="mt-0.5 text-[10px] text-emerald-600">{submitDeltaLabel}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] font-medium text-zinc-400">첨삭 완료</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{reviewedCount}건</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">이번달</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <p className="text-[10px] font-medium text-indigo-400">종합 성장점수</p>
              <p className="mt-1 text-2xl font-bold text-indigo-700">{growthScore ?? "−"}</p>
              <p className="mt-0.5 text-[10px] text-emerald-600">{growthDeltaLabel}</p>
            </div>
          </div>

          {/* 서술 요약 */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3.5 space-y-1.5">
            {monthlyReportLines.map((line, index) => (
              <p key={index} className="text-[11px] leading-relaxed text-zinc-600">{line}</p>
            ))}
          </div>

          {/* 칩 */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {["출석", "과제 제출", "첨삭 완료", "리포트 발행"].map((chip) => (
              <span key={chip} className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-medium text-indigo-700">
                {chip}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
