"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";

export type PortfolioStudentOption = {
  id: string;
  name: string;
  createdAt: string | null;
};

export type PortfolioHistoryItem = {
  submissionId: string;
  assignmentTitle: string;
  status: string;
  isRepresentative: boolean;
  scoreText: string;
  commentPreview: string;
};

type RepresentativeOption = {
  submissionId: string;
  label: string;
};

type PortfolioClientProps = {
  students: PortfolioStudentOption[];
  selectedStudentId: string;
  selectedStudentName: string;
  selectedClassName: string;
  firstSubmissionText: string;
  totalSubmissions: number;
  reviewedCount: number;
  revisedCount: number;
  growthScore: number | null;
  growthDelta: number;
  historyItems: PortfolioHistoryItem[];
  beforeText: string;
  afterText: string;
  improvementText: string;
  monthLabel: string;
  representativeId: string | null;
  representativeOptions: RepresentativeOption[];
  onSetRepresentative: (submissionId: string, studentId: string) => Promise<{ ok: boolean; message?: string }>;
};

export default function PortfolioClient({
  students,
  selectedStudentId,
  selectedStudentName,
  selectedClassName,
  firstSubmissionText,
  totalSubmissions,
  reviewedCount,
  revisedCount,
  growthScore,
  growthDelta,
  historyItems,
  beforeText,
  afterText,
  improvementText,
  monthLabel,
  representativeId,
  representativeOptions,
  onSetRepresentative,
}: PortfolioClientProps) {
  const router = useRouter();
  const [isSaving, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);
  const [draftRepresentativeId, setDraftRepresentativeId] = useState<string>(representativeId ?? representativeOptions[0]?.submissionId ?? "");
  const completionRate = totalSubmissions > 0 ? Math.round((reviewedCount / totalSubmissions) * 100) : 0;
  const revisedRate = totalSubmissions > 0 ? Math.round((revisedCount / totalSubmissions) * 100) : 0;

  const growthDeltaLabel = useMemo(() => {
    if (growthDelta > 0) return `↑ +${growthDelta} (입학 대비)`;
    if (growthDelta < 0) return `↓ ${growthDelta} (입학 대비)`;
    return "→ +0 (입학 대비)";
  }, [growthDelta]);

  const handleSelectStudent = (studentId: string) => {
    router.push(`/admin/portfolio?studentId=${studentId}`);
  };

  const handleSetRepresentative = () => {
    if (!draftRepresentativeId) return;
    startTransition(async () => {
      const result = await onSetRepresentative(draftRepresentativeId, selectedStudentId);
      if (!result.ok) {
        alert(result.message ?? "대표작 저장에 실패했습니다.");
        return;
      }
      setShowPicker(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          header, nav, aside, [data-no-print] { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3" data-no-print>
        <h1 className="text-lg font-bold text-zinc-900">포트폴리오</h1>
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
          <h2 className="text-2xl font-bold text-zinc-900">학생 포트폴리오</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {selectedStudentName} · {selectedClassName} · 논술 시작 {firstSubmissionText} · 총 {totalSubmissions}편 제출
          </p>
        </div>
        <div className="flex items-center gap-2" data-no-print>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            PDF 출력
          </button>
          <button
            type="button"
            onClick={() => setShowPicker((prev) => !prev)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            대표작 선정
          </button>
        </div>
      </div>

      <Card className="p-4" data-no-print>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-500">학생 선택</label>
          <select
            value={selectedStudentId}
            onChange={(event) => handleSelectStudent(event.target.value)}
            className="h-10 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {showPicker ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <select
              value={draftRepresentativeId}
              onChange={(event) => setDraftRepresentativeId(event.target.value)}
              className="h-9 min-w-[280px] rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            >
              {representativeOptions.map((option) => (
                <option key={option.submissionId} value={option.submissionId}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSetRepresentative}
              disabled={isSaving || !draftRepresentativeId}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : "대표작으로 저장"}
            </button>
          </div>
        ) : null}
      </Card>

      <Card className="p-3">
        <div className="grid grid-cols-4 divide-x divide-zinc-100">
          <div className="px-4 py-1 text-center first:pl-2">
            <p className="text-[10px] font-medium text-zinc-400">제출 총 편수</p>
            <p className="mt-0.5 text-xl font-bold text-zinc-900">{totalSubmissions}</p>
            <p className="mt-0.5 text-[10px] text-emerald-600">{Math.max(totalSubmissions - reviewedCount, 0)}편 진행 중</p>
          </div>
          <div className="px-4 py-1 text-center">
            <p className="text-[10px] font-medium text-zinc-400">첨삭 완료</p>
            <p className="mt-0.5 text-xl font-bold text-zinc-900">{reviewedCount}</p>
            <p className="mt-0.5 text-[10px] text-emerald-600">완료율 {completionRate}%</p>
          </div>
          <div className="px-4 py-1 text-center">
            <p className="text-[10px] font-medium text-zinc-400">수정 제출</p>
            <p className="mt-0.5 text-xl font-bold text-zinc-900">{revisedCount}</p>
            <p className="mt-0.5 text-[10px] text-amber-600">{revisedRate}% 재제출</p>
          </div>
          <div className="px-4 py-1 text-center last:pr-2">
            <p className="text-[10px] font-medium text-indigo-400">종합 성장점수</p>
            <p className="mt-0.5 text-xl font-bold text-indigo-700">{growthScore ?? "−"}</p>
            <p className="mt-0.5 text-[10px] text-emerald-600">{growthDeltaLabel}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">글 성장 이력 (최근 3편)</h3>
            <button type="button" disabled className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500">
              전체보기
            </button>
          </div>
          <div className="space-y-2">
            {historyItems.length === 0 ? (
              <p className="text-sm text-zinc-400">제출 이력이 없습니다.</p>
            ) : (
              historyItems.map((item) => (
                <div
                  key={item.submissionId}
                  className={`rounded-lg border px-3 py-2 ${
                    item.isRepresentative
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-800">{item.assignmentTitle}</p>
                    {item.isRepresentative ? (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">대표작</span>
                    ) : item.status === "reviewed" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">수정 제출</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">첨삭 완료</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-600">{item.scoreText}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.commentPreview}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Before / After 비교</h3>
            <span className="text-xs text-zinc-400">{monthLabel}</span>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <p className="text-xs font-semibold">첨삭 전 (초고)</p>
              <p className="mt-1">{beforeText}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <p className="text-xs font-semibold">수정 후 (최종본)</p>
              <p className="mt-1">{afterText}</p>
            </div>
            <div className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              <p className="text-xs font-semibold">{improvementText}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
