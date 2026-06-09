"use client";

import { useState } from "react";

type SubmitType = "text" | "image";

type SubmitTypeSelectorProps = {
  initialType?: SubmitType;
  onChange?: (value: SubmitType) => void;
  textContent?: React.ReactNode;
  imageContent?: React.ReactNode;
};

export default function SubmitTypeSelector({
  initialType = "text",
  onChange,
  textContent,
  imageContent,
}: SubmitTypeSelectorProps) {
  const [type, setType] = useState<SubmitType>(initialType);

  function select(next: SubmitType) {
    setType(next);
    onChange?.(next);
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-lg border border-[#D4D9F5] bg-white p-1">
        <button
          type="button"
          onClick={() => select("text")}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
            type === "text" ? "bg-[#3A4BFF] text-white" : "text-[#4A55A8]"
          }`}
        >
          텍스트 제출
        </button>
        <button
          type="button"
          onClick={() => select("image")}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
            type === "image" ? "bg-[#3A4BFF] text-white" : "text-[#4A55A8]"
          }`}
        >
          이미지 제출
        </button>
      </div>

      {textContent || imageContent ? <div>{type === "text" ? textContent : imageContent}</div> : null}
    </div>
  );
}

