"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

type SubmitTab = "text" | "image_pdf" | "file";

type AssignmentSubmitClientProps = {
  assignmentId: string;
  title: string;
  description: string;
  className: string;
  dday: string;
  minLen: number;
  maxLen: number;
  submissionStatus: string | null;
  initialText: string;
  submittedAtFormatted: string | null;
  serverStatus: string | null;
  textAction: (formData: FormData) => Promise<void>;
  fileAction: (formData: FormData) => Promise<void>;
};

const CLIENT_MAX_FILE_BYTES = 100 * 1024 * 1024;
const DRAFT_SAVE_DEBOUNCE_MS = 1000;

function formatNowTime(): string {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusMessage(status: string | null, minLen: number) {
  switch (status) {
    case "submitted":
      return { tone: "success", text: "제출이 완료되었습니다." };
    case "too_short":
      return { tone: "warn", text: `최소 ${minLen}자 이상 입력해 주세요.` };
    case "readonly":
      return { tone: "warn", text: "첨삭 완료된 제출물은 수정할 수 없습니다." };
    case "error":
      return { tone: "error", text: "제출에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    case "upload_error":
      return { tone: "error", text: "파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    case "bucket_missing":
      return { tone: "error", text: "스토리지가 준비되지 않았습니다. 관리자에게 문의하세요." };
    case "forbidden":
      return { tone: "error", text: "이 화면에 접근할 권한이 없습니다. 필요한 경우 관리자에게 문의해 주세요." };
    case "file_required":
      return { tone: "warn", text: "파일을 먼저 선택해 주세요." };
    case "invalid_file":
      return { tone: "warn", text: "JPG, JPEG, PNG, PDF 파일만 제출할 수 있습니다." };
    case "file_too_large":
      return { tone: "warn", text: "파일 용량은 10MB 이하만 업로드할 수 있습니다." };
    default:
      return null;
  }
}

export default function AssignmentSubmitClient({
  assignmentId,
  title,
  description,
  className,
  dday,
  minLen,
  maxLen,
  submissionStatus,
  initialText,
  submittedAtFormatted,
  serverStatus,
  textAction,
  fileAction,
}: AssignmentSubmitClientProps) {
  const draftKey = `assignment_draft_${assignmentId}`;
  const textFormRef = useRef<HTMLFormElement>(null);
  const fileFormRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<number | null>(null);

  const [activeTab, setActiveTab] = useState<SubmitTab>("text");
  const [essayText, setEssayText] = useState(initialText);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const isReadOnly = submissionStatus === "reviewed";
  const currentCount = essayText.length;
  const countState = currentCount > maxLen ? "over" : currentCount >= minLen ? "ok" : "short";
  const statusMessage = getStatusMessage(serverStatus, minLen);

  const statusClassName = useMemo(() => {
    if (!statusMessage) return "";
    if (statusMessage.tone === "success") return "border-green-200 bg-green-50 text-green-700";
    if (statusMessage.tone === "warn") return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-red-200 bg-red-50 text-red-700";
  }, [statusMessage]);

  const saveDraft = (content: string) => {
    localStorage.setItem(draftKey, content);
  };

  const handleManualDraftSave = () => {
    saveDraft(essayText);
    setToastMessage(`저장됨 ${formatNowTime()}`);
    window.setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    if (initialText.trim()) {
      setEssayText(initialText);
      return;
    }

    const saved = localStorage.getItem(draftKey);
    if (saved) {
      setEssayText(saved);
    }
  }, [draftKey, initialText]);

  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveDraft(essayText);
    }, DRAFT_SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [essayText]);

  const handleSubmit = () => {
    if (isReadOnly) return;

    setFileError(null);
    startTransition(() => {
      if (activeTab === "text") {
        textFormRef.current?.requestSubmit();
      }
    });
  };

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      setFileError("파일을 먼저 선택해 주세요.");
      setSelectedFile(null);
      return false;
    }
    if (file.size > CLIENT_MAX_FILE_BYTES) {
      setFileError("파일 용량은 100MB 이하만 업로드할 수 있습니다.");
      setSelectedFile(null);
      return false;
    }
    setFileError(null);
    setSelectedFile(file);
    return true;
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const dropped = event.dataTransfer.files?.[0] ?? null;
    if (!dropped) return;
    if (!handleFileSelection(dropped)) return;

    const dt = new DataTransfer();
    dt.items.add(dropped);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  };

  const handleTabChange = (nextTab: SubmitTab) => {
    setActiveTab(nextTab);
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0F172A]">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/student/assignments" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            {"<- 과제 목록"}
          </Link>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="숙제, 과제, 강의 검색..."
              className="h-9 w-56 rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-indigo-400"
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500"
              aria-label="알림"
            >
              ◻
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500"
              aria-label="프로필"
            >
              ◯
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {statusMessage ? (
          <div className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${statusClassName}`}>{statusMessage.text}</div>
        ) : null}

        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">과제 제출</h1>
            <p className="mt-1 text-sm text-gray-600">
              {className} · {title} · 마감 {dday} · {minLen}~{maxLen}자
            </p>
            {submittedAtFormatted ? (
              <p className="mt-1 text-xs text-gray-500">
                최근 제출/수정: {submittedAtFormatted}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualDraftSave}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              임시저장
            </button>
            {activeTab === "text" ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isReadOnly}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {isSubmitting ? "제출 중..." : "최종 제출"}
              </button>
            ) : null}
          </div>
        </div>

        {toastMessage ? (
          <div className="mb-4 inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
            {toastMessage}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">과제 안내</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">{description || "과제 안내가 없습니다."}</p>
              <div className="mt-4 flex items-center gap-4 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => handleTabChange("text")}
                  className={`pb-2 text-sm font-medium ${
                    activeTab === "text" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"
                  }`}
                >
                  텍스트 직접 작성
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("image_pdf")}
                  className={`pb-2 text-sm font-medium ${
                    activeTab === "image_pdf" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"
                  }`}
                >
                  이미지/PDF 업로드
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("file")}
                  className={`pb-2 text-sm font-medium ${
                    activeTab === "file" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"
                  }`}
                >
                  파일 업로드
                </button>
              </div>
            </div>

            {activeTab !== "text" ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <form ref={fileFormRef} action={fileAction}>
                  <div className="mb-2 text-right text-xs text-gray-500">JPG · PNG · PDF · DOCX · 최대 100MB</div>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition ${
                      selectedFile
                        ? "border-indigo-300 bg-indigo-50"
                        : isDragOver
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-gray-300 bg-gray-50"
                    } ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="submission_file"
                      className="hidden"
                      disabled={isReadOnly}
                      onChange={handleFileInputChange}
                    />
                    {selectedFile ? (
                      <>
                        <p className="text-sm font-semibold text-indigo-700">{selectedFile.name}</p>
                        <p className="mt-1 text-xs text-indigo-600">{formatFileSize(selectedFile.size)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700">파일을 드래그하거나 클릭하여 업로드</p>
                        <p className="mt-1 text-xs text-gray-500">손글씨 원고지 사진도 첨부 가능</p>
                      </>
                    )}
                  </label>
                  {selectedFile && !isReadOnly ? (
                    <button
                      type="submit"
                      className="mt-3 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      제출하기
                    </button>
                  ) : null}
                </form>
                {fileError ? <p className="mt-2 text-sm text-red-600">{fileError}</p> : null}
              </div>
            ) : null}
          </section>

          <section>
            <div className="flex h-full min-h-[520px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">원고 작성</h2>
                <span className={`text-sm font-medium ${currentCount > maxLen ? "text-red-600" : "text-indigo-600"}`}>
                  {currentCount} / {maxLen}자
                </span>
              </div>

              <form ref={textFormRef} action={textAction} className="flex flex-1 flex-col">
                <textarea
                  name="content_text"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  readOnly={isReadOnly}
                  placeholder="여기에 논술문을 작성하세요. 주장을 먼저 쓰고, 근거를 구체적인 사례와 함께 전개해 보세요..."
                  className="min-h-[400px] flex-1 resize-none rounded-lg border border-gray-200 p-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </form>

              <div className="mt-3 grid grid-cols-2 items-center text-sm">
                <p className="text-gray-600">최소 {minLen}자 이상 작성</p>
                <p className="text-right font-medium">
                  {countState === "short" ? (
                    <span className="text-red-600">기준 미달</span>
                  ) : null}
                  {countState === "ok" ? (
                    <span className="text-green-600">✓ 기준 충족</span>
                  ) : null}
                  {countState === "over" ? (
                    <span className="text-red-600">글자수 초과</span>
                  ) : null}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
