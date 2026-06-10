"use client";

import { useMemo, useState } from "react";

type EssayTextareaProps = {
  initialValue?: string;
  minLength?: number;
  maxLength?: number;
  name?: string;
  readOnly?: boolean;
};

export default function EssayTextarea({
  initialValue = "",
  minLength = 300,
  maxLength = 3000,
  name = "content_text",
  readOnly = false,
}: EssayTextareaProps) {
  const [value, setValue] = useState(initialValue);
  const count = value.length;
  const countWithoutSpaces = value.replace(/\s/g, "").length;
  const helper = useMemo(() => {
    if (count < minLength) return `최소 ${minLength}자 이상 작성해 주세요.`;
    if (count > maxLength) return `최대 ${maxLength}자를 초과했습니다.`;
    return "작성 분량이 적절합니다.";
  }, [count, maxLength, minLength]);

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        name={name}
        readOnly={readOnly}
        rows={10}
        className="w-full rounded-xl border border-[#D4D9F5] p-3 text-sm text-[#06091F] outline-none focus:border-[#3A4BFF]"
        placeholder="논술 답안을 입력해 주세요."
      />
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#6470BF]">{helper}</span>
        <span className="text-[#4A55A8]">공백 포함 {count}자 · 공백 제외 {countWithoutSpaces}자</span>
      </div>
    </div>
  );
}

