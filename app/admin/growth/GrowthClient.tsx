"use client";

import { useRouter } from "next/navigation";

export type GrowthStudentOption = {
  id: string;
  name: string;
};

export type GrowthMetricItem = {
  label: string;
  score: number | null;
  delta: number | null;
  color: "blue" | "green" | "yellow" | "orange";
};

export type GrowthMonthlyPoint = {
  monthLabel: string;
  score: number;
};

type GrowthClientProps = {
  students: GrowthStudentOption[];
  selectedStudentId: string;
  selectedStudentLabel: string;
  selectedClassLabel: string;
  metrics: GrowthMetricItem[];
  monthlyPoints: GrowthMonthlyPoint[];
  readingRubricLevel: number;
};

const COLOR_THEME: Record<GrowthMetricItem["color"], { text: string; bar: string }> = {
  blue: { text: "text-indigo-600", bar: "bg-indigo-500" },
  green: { text: "text-emerald-600", bar: "bg-emerald-500" },
  yellow: { text: "text-amber-600", bar: "bg-amber-500" },
  orange: { text: "text-orange-600", bar: "bg-orange-500" },
};

const RUBRIC_ITEMS = [
  { level: 5, text: "제시문 간 관계, 숨은 전제, 논제와의 연결까지 깊이 이해함" },
  { level: 4, text: "핵심 주장과 근거를 정확히 파악함" },
  { level: 3, text: "제시문의 중심 내용을 대체로 이해함" },
  { level: 2, text: "일부 이해하지만 핵심 주장 파악 부족" },
];

export default function GrowthClient({
  students,
  selectedStudentId,
  selectedStudentLabel,
  selectedClassLabel,
  metrics,
  monthlyPoints,
  readingRubricLevel,
}: GrowthClientProps) {
  const router = useRouter();

  const bestPoint = monthlyPoints.reduce(
    (best, point) => (point.score > best.score ? point : best),
    monthlyPoints[0] ?? { monthLabel: "-", score: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">성장지표 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">
            독해·사고·논리·구성·표현·창의·성실·발표 8개 영역 루브릭 기반 추적
          </p>
        </div>
        <select
          value={selectedStudentId}
          onChange={(event) => router.push(`/admin/growth?studentId=${event.target.value}`)}
          className="h-10 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-zinc-500">{selectedStudentLabel} · {selectedClassLabel}</p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const color = COLOR_THEME[metric.color];
          const score = metric.score;
          const progress = Math.max(0, Math.min(100, score ?? 0));
          const deltaText =
            metric.delta === null
              ? "→ +0 (1개월)"
              : metric.delta > 0
                ? `↑ +${metric.delta} (1개월)`
                : metric.delta < 0
                  ? `↓ ${metric.delta} (1개월)`
                  : "→ +0 (1개월)";

          return (
            <div key={metric.label} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500">{metric.label}</p>
              <p className={`mt-1 text-3xl font-bold ${color.text}`}>{score === null ? "-" : `${score}/100`}</p>
              <p className="mt-1 text-xs text-zinc-500">{deltaText}</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100">
                <div className={`h-1.5 rounded-full ${color.bar}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">월별 종합 성장 추이</h2>
            <span className="text-xs text-zinc-400">
              {bestPoint.score} · {new Date().getFullYear()}년 {bestPoint.monthLabel}
            </span>
          </div>
          <div className="flex h-40 items-end gap-1">
            {monthlyPoints.map((point, index) => {
              const height = Math.max(8, Math.round((point.score / 100) * 128));
              const isLast = index === monthlyPoints.length - 1;
              return (
                <div key={point.monthLabel} className="flex flex-1 flex-col items-center">
                  <div
                    className={`w-full rounded-t ${isLast ? "bg-indigo-600" : "bg-indigo-300"}`}
                    style={{ height }}
                  />
                  <p className="mt-2 text-xs text-zinc-400">{point.monthLabel}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">루브릭 기준 (독해력 예시)</h2>
            <button type="button" disabled className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500">
              전체 보기
            </button>
          </div>
          <div className="space-y-2">
            {RUBRIC_ITEMS.map((item) => {
              const isCurrent = readingRubricLevel === item.level;
              const isFive = item.level === 5;
              return (
                <div
                  key={item.level}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    isCurrent ? "bg-indigo-100 text-indigo-700" : isFive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  <span className="font-semibold">{item.level}점</span>: {item.text}
                  {isCurrent ? " ← 현재" : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
