"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { LmsMockData } from "@/lib/lms/types";

type SubmitPanelProps = {
  data: LmsMockData;
};

export default function SubmitPanel({ data }: SubmitPanelProps) {
  const [text, setText] = useState("");
  const count = useMemo(() => text.trim().length, [text]);
  const countState =
    count < data.submitGuide.minChars
      ? "short"
      : count <= data.submitGuide.maxChars
        ? "ok"
        : "long";

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-[var(--color-neutral-1000)]">과제 제출</h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-neutral-400)]">
            {data.submitGuide.assignmentTitle} · 마감 {data.submitGuide.dueDate} · {data.submitGuide.minChars}–{data.submitGuide.maxChars}자
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">임시저장</Button>
          <Button variant="primary" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">최종 제출</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          <Card className="rounded-[var(--lms-rl)] p-3">
            <h4 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">과제 안내</h4>
            <div className="mt-2 rounded-[var(--lms-r)] bg-[var(--color-neutral-50)] p-2.5 text-[11.5px] leading-relaxed text-[var(--color-neutral-800)]">
              다음 논제에 대해 자신의 주장과 근거를 논리적으로 전개하세요.
            </div>
          </Card>
          <Card className="rounded-[var(--lms-rl)] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <h4 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">파일 업로드</h4>
              <span className="text-[10px] text-[var(--color-neutral-400)]">JPG · PNG · PDF · DOCX</span>
            </div>
            <div className="rounded-[var(--lms-r)] border border-dashed border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] p-6 text-center text-[11.5px] text-[var(--color-neutral-400)]">
              파일을 드래그하거나 클릭하여 업로드
            </div>
          </Card>
        </div>

        <Card className="rounded-[var(--lms-rl)] p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <h4 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">원고 작성</h4>
            <span
              className={`text-[11px] font-bold ${
                countState === "ok" ? "text-[var(--lms-ok)]" : "text-[var(--lms-er)]"
              }`}
            >
              {count.toLocaleString()} / {data.submitGuide.maxChars.toLocaleString()}자
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-[280px] w-full resize-none rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] p-2.5 text-[12px] leading-relaxed outline-none focus:border-[var(--lms-br-2)]"
            placeholder="여기에 논술문을 작성하세요..."
          />
          <div className="mt-1.5 flex justify-between text-[10.5px]">
            <span className="text-[var(--color-neutral-400)]">최소 {data.submitGuide.minChars}자 이상 작성</span>
            <span
              className={
                countState === "ok"
                  ? "text-[var(--lms-ok)]"
                  : countState === "long"
                    ? "text-[var(--lms-er)]"
                    : "text-[var(--lms-er)]"
              }
            >
              {countState === "ok"
                ? "제출 가능"
                : countState === "long"
                  ? `${count - data.submitGuide.maxChars}자 초과`
                  : `최소 ${Math.max(0, data.submitGuide.minChars - count)}자 더 작성`}
            </span>
          </div>
          <div className="mt-3 flex justify-end gap-1.5">
            <Button variant="ghost" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">임시저장</Button>
            <Button variant="primary" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">최종 제출</Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
