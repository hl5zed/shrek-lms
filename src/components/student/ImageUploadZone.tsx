"use client";

import { useActionState } from "react";
import { useState, type ChangeEvent } from "react";

type ImageUploadZoneProps = {
  action?: (formData: FormData) => void;
  readOnly?: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageUploadZone({ action, readOnly = false }: ImageUploadZoneProps) {
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [clientMessage, setClientMessage] = useState("");
  const [, formAction, isPending] = useActionState(async (_prev: null, formData: FormData) => {
    const file = formData.get("submission_file");
    if (!(file instanceof File) || file.size <= 0) {
      setClientMessage("파일을 먼저 선택해 주세요.");
      return null;
    }
    if (!action) {
      setClientMessage("현재 이 화면에서는 파일 제출을 지원하지 않습니다.");
      return null;
    }
    setClientMessage("");
    await action(formData);
    return null;
  }, null);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      setFileSize(0);
      setClientMessage("");
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);
    setClientMessage("");
  }

  if (readOnly) {
    return (
      <div className="rounded-xl border border-[#D4D9F5] bg-[#F5F7FF] p-3 text-sm text-[#4A55A8]">
        첨삭 완료된 답안은 수정할 수 없습니다.
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-dashed border-[#A8AFFF] bg-[#EEF1FF] p-4">
      <p className="text-sm font-medium text-[#3A4BFF]">파일 제출</p>
      <p className="mt-1 text-xs text-[#6470BF]">JPG, PNG, PDF 파일을 선택해 주세요. (최대 10MB)</p>

      <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-[#3A4BFF] px-3 py-2 text-xs font-semibold text-white">
        파일 선택
        <input
          type="file"
          name="submission_file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={onFileChange}
        />
      </label>

      {fileName ? (
        <div className="mt-3 rounded-lg border border-[#D4D9F5] bg-white p-3">
          <p className="truncate text-sm font-medium text-[#06091F]">{fileName}</p>
          <p className="mt-1 text-xs text-[#6470BF]">{formatBytes(fileSize)}</p>
        </div>
      ) : null}

      {clientMessage ? <p className="mt-2 text-xs text-[#C03232]">{clientMessage}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-3 min-h-11 w-full rounded-lg bg-[#3A4BFF] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "업로드 중..." : "최종 제출"}
      </button>
    </form>
  );
}

