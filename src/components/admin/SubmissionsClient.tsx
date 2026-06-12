"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type AdminSubmissionRow = {
  id: string;
  studentName: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentDescription: string;
  classId: string;
  className: string;
  dueDate: string | null;
  submittedAt: string | null;
  submittedAtText: string;
  elapsed: string;
  isReviewed: boolean;
  contentText: string;
  contentPreview: string;
  wordCount: number;
  fileUrls: unknown[];
  fileCount: number;
  submitType: "text" | "file" | "none";
};

type FilterClass = {
  id: string;
  name: string;
};

type FilterAssignment = {
  id: string;
  title: string;
  classId: string;
};

type SubmissionsClientProps = {
  rows: AdminSubmissionRow[];
  classes: FilterClass[];
  assignments: FilterAssignment[];
  currentStatus: "all" | "pending" | "reviewed";
  currentClassId: string;
  currentAssignmentId: string;
  subtitle: string;
};

type SubmissionFile = {
  name?: string;
  size?: number;
  type?: string;
  path?: string;
  url?: string;
};

function toHref(params: { status: string; classId?: string; assignmentId?: string }) {
  const search = new URLSearchParams();
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.classId) search.set("classId", params.classId);
  if (params.assignmentId) search.set("assignmentId", params.assignmentId);
  const qs = search.toString();
  return `/admin/submissions${qs ? `?${qs}` : ""}`;
}

// 제출 파일 메타를 안전하게 파싱해 리스트에 표시 가능한 형태로 변환합니다.
function normalizeFiles(fileUrls: unknown[]): SubmissionFile[] {
  return fileUrls
    .map((item) => (typeof item === "object" && item !== null ? (item as SubmissionFile) : null))
    .filter((item): item is SubmissionFile => Boolean(item));
}

function formatFileSize(size?: number): string {
  if (!size || size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type?: string, name?: string): string {
  const lowerType = (type ?? "").toLowerCase();
  const lowerName = (name ?? "").toLowerCase();
  if (lowerType.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/.test(lowerName)) return "🖼️";
  if (lowerType.includes("pdf") || lowerName.endsWith(".pdf")) return "📕";
  if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) return "📄";
  return "📎";
}

async function getSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from("submissions").createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

function isImageFile(file: SubmissionFile): boolean {
  const lowerType = (file.type ?? "").toLowerCase();
  const lowerName = (file.name ?? "").toLowerCase();
  return lowerType.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(lowerName);
}

function FileItem({ file }: { file: SubmissionFile }) {
  const [isOpening, setIsOpening] = useState(false);

  async function handleOpen() {
    if (isOpening) return;
    setIsOpening(true);

    const targetPath = file.path?.trim() || "";
    const fallbackUrl = file.url?.trim() || "";
    let resolvedUrl: string | null = null;

    if (targetPath) {
      resolvedUrl = await getSignedUrl(targetPath);
    } else if (fallbackUrl) {
      if (/^https?:\/\//i.test(fallbackUrl)) {
        resolvedUrl = fallbackUrl;
      } else {
        resolvedUrl = await getSignedUrl(fallbackUrl);
      }
    }

    setIsOpening(false);

    if (!resolvedUrl) {
      alert("파일을 열 수 없습니다.");
      return;
    }

    if (isImageFile(file)) {
      window.open(resolvedUrl, "_blank", "noopener,noreferrer");
      return;
    }

    window.open(resolvedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <li>
      <button
        type="button"
        onClick={handleOpen}
        disabled={isOpening}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="truncate text-zinc-700">
          {getFileIcon(file.type, file.name)} {file.name ?? file.path ?? file.url ?? "파일"}
        </span>
        <span className="ml-2 shrink-0 text-xs text-zinc-500">
          {isOpening ? "열기 중..." : `${formatFileSize(file.size)} · 열기`}
        </span>
      </button>
    </li>
  );
}

// 마감일 기준 D-day 문자열을 계산합니다.
function getDday(dueDate: string | null): string {
  if (!dueDate) return "날짜 미정";
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return dueDate;

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diff = Math.floor((dueOnly.getTime() - todayOnly.getTime()) / 86400000);

  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-Day";
  return `D+${Math.abs(diff)}`;
}

export default function SubmissionsClient({
  rows,
  classes,
  assignments,
  currentStatus,
  currentClassId,
  currentAssignmentId,
  subtitle,
}: SubmissionsClientProps) {
  const router = useRouter();
  const saveTimerRef = useRef<number | null>(null);
  const [selectedId, setSelectedId] = useState<string>(rows[0]?.id ?? "");
  const [saveButtonText, setSaveButtonText] = useState("임시저장");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => {
      const student = row.studentName.toLowerCase();
      const assignment = row.assignmentTitle.toLowerCase();
      return student.includes(query) || assignment.includes(query);
    });
  }, [rows, searchQuery]);

  const selectedRow = useMemo(
    () => filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? null,
    [filteredRows, selectedId],
  );
  const selectedFiles = selectedRow ? normalizeFiles(selectedRow.fileUrls) : [];
  const pendingCount = rows.filter((row) => !row.isReviewed).length;
  const hasSelectedRow = Boolean(selectedRow);

  const headerSubtitle = selectedRow
    ? `${selectedRow.assignmentTitle} · 마감 ${getDday(selectedRow.dueDate)} · 800~1,200자`
    : `전체 과제 · ${rows.length}건`;

  useEffect(() => {
    // 임시저장한 선택 항목이 현재 목록에 존재하면 우선 복원합니다.
    const savedId = localStorage.getItem("submissions_last_id");
    if (savedId && rows.some((row) => row.id === savedId)) {
      setSelectedId(savedId);
      return;
    }
    setSelectedId(rows[0]?.id ?? "");
  }, [rows]);

  useEffect(() => {
    if (!selectedRow) {
      setSelectedId(filteredRows[0]?.id ?? "");
    }
  }, [filteredRows, selectedRow]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedRow) return;

    const MAX_BYTES = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_BYTES) {
      setUploadStatus("error");
      setUploadError("파일 크기가 50MB를 초과합니다.");
      return;
    }

    setUploadStatus("uploading");
    setUploadError("");

    const path = `admin/${selectedRow.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { data, error } = await supabase.storage.from("submissions").upload(path, file, { upsert: false });

    if (error || !data) {
      setUploadStatus("error");
      setUploadError("업로드 실패: " + (error?.message ?? "알 수 없는 오류"));
      return;
    }

    const { data: urlData } = supabase.storage.from("submissions").getPublicUrl(data.path);

    const newFile = { name: file.name, size: file.size, type: file.type, path: data.path, url: urlData.publicUrl };
    const updatedFiles = [...selectedRow.fileUrls, newFile];

    const { error: updateError } = await supabase
      .from("submissions")
      .update({ file_urls: updatedFiles })
      .eq("id", selectedRow.id);

    if (updateError) {
      setUploadStatus("error");
      setUploadError("DB 업데이트 실패: " + updateError.message);
      return;
    }

    setUploadStatus("done");
    // 목록 새로고침
    router.refresh();
  }

  function handleDraftSave() {
    if (!selectedRow) return;
    localStorage.setItem("submissions_last_id", selectedRow.id);
    setSaveButtonText("저장됨 ✓");
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      setSaveButtonText("임시저장");
    }, 2000);
  }

  function handlePrimaryAction() {
    if (!selectedRow) return;
    router.push(`/admin/feedback/${selectedRow.id}`);
  }

  return (
    <div className="-m-6 flex h-full flex-col bg-[#F5F7FB]">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-3">
          <h1 className="text-lg font-bold text-zinc-900">과제 제출</h1>
          <div className="flex items-center gap-2">
            <input
              name="q"
              placeholder="학생, 과제, 강의의 검색..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9 w-52 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500"
              aria-label="알림"
            >
              ◻
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500"
              aria-label="설정"
            >
              ⚙
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-3">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">과제 제출</h2>
            <p className="mt-1 text-sm text-zinc-500">{headerSubtitle}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(toHref({ status: "all", classId: currentClassId || undefined, assignmentId: currentAssignmentId || undefined }))}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                  currentStatus === "all"
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    toHref({
                      status: "pending",
                      classId: currentClassId || undefined,
                      assignmentId: currentAssignmentId || undefined,
                    }),
                  )
                }
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                  currentStatus === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                첨삭 대기
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    toHref({
                      status: "reviewed",
                      classId: currentClassId || undefined,
                      assignmentId: currentAssignmentId || undefined,
                    }),
                  )
                }
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                  currentStatus === "reviewed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                첨삭 완료
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDraftSave}
              disabled={!hasSelectedRow}
              className={`h-10 rounded-lg border px-4 text-sm font-medium transition ${
                hasSelectedRow
                  ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  : "border-zinc-300 bg-white text-zinc-500 opacity-50"
              }`}
            >
              {saveButtonText}
            </button>
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={!hasSelectedRow}
              className={`h-10 rounded-lg px-4 text-sm font-semibold text-white transition ${
                !hasSelectedRow
                  ? "bg-zinc-300 opacity-50"
                  : selectedRow.isReviewed
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {!hasSelectedRow ? "최종 제출" : selectedRow.isReviewed ? "첨삭 보기" : "첨삭하기 →"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[280px_1fr_1fr]">
          <div className="rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-800">
                제출물 목록 <span className="font-normal text-zinc-400">({filteredRows.length})</span>
              </p>
            </div>
            <div className="max-h-[620px] overflow-y-auto p-2">
              {filteredRows.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-zinc-400">제출된 과제가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {filteredRows.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                        selectedRow?.id === row.id
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-900">{row.studentName}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            row.isReviewed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {row.isReviewed ? "첨삭 완료" : "첨삭 대기"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-zinc-600">{row.assignmentTitle}</p>
                      <p className="mt-1 text-[11px] text-zinc-400">제출: {row.submittedAtText}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              {!selectedRow ? (
                <p className="text-sm text-zinc-400">제출물을 선택하세요</p>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                    {selectedRow.assignmentDescription || selectedRow.assignmentTitle}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                      텍스트 직접 작성
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      이미지/PDF 업로드
                    </span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      파일 업로드
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900">파일 업로드</h3>
                <span className="text-xs text-zinc-400">JPG · PNG · PDF · DOCX · 최대 50MB</span>
              </div>

              {selectedFiles.length > 0 && (
                <ul className="mb-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <FileItem key={`${file.path ?? file.url ?? file.name ?? "file"}-${index}`} file={file} />
                  ))}
                </ul>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.docx"
                className="sr-only"
                onChange={handleFileUpload}
                disabled={!selectedRow || uploadStatus === "uploading"}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedRow || uploadStatus === "uploading"}
                className="w-full rounded-lg border border-dashed border-zinc-300 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadStatus === "uploading" ? (
                  <p className="text-sm text-indigo-500">업로드 중…</p>
                ) : uploadStatus === "done" ? (
                  <p className="text-sm text-green-600">✅ 업로드 완료</p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-400">파일을 드래그하거나 클릭하여 업로드</p>
                    <p className="mt-1 text-xs text-zinc-400">손글씨 원고지 사진도 첨부 가능</p>
                  </>
                )}
              </button>
              {uploadStatus === "error" && (
                <p className="mt-1 text-xs text-red-500">{uploadError}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex h-full min-h-[480px] flex-col rounded-xl border border-zinc-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900">원고 작성</h3>
                <span className="text-sm font-medium text-indigo-600">
                  {selectedRow?.wordCount ?? 0} / 1,200자
                </span>
              </div>

              <textarea
                readOnly
                value={selectedRow?.contentText ?? ""}
                placeholder="여기에 논술문을 작성하세요. 주장을 먼저 쓰고, 근거를 구체적인 사례와 함께 전개해 보세요..."
                className="min-h-[300px] w-full flex-1 resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-800 outline-none"
              />

              <div className="mt-3 flex justify-between text-sm">
                <p className="text-zinc-500">최소 800자 이상 작성</p>
                {(selectedRow?.wordCount ?? 0) >= 800 ? (
                  <p className="font-medium text-green-600">✓ 기준 충족</p>
                ) : (selectedRow?.wordCount ?? 0) > 0 ? (
                  <p className="font-medium text-red-600">기준 미달</p>
                ) : (
                  <p className="font-medium text-zinc-400">기준 미달</p>
                )}
              </div>

              {selectedRow ? (
                <div className="mt-4">
                  <Link
                    href={`/admin/feedback/${selectedRow.id}`}
                    className={`inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold text-white ${
                      selectedRow.isReviewed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {selectedRow.isReviewed ? "첨삭 보기" : "첨삭하기 →"}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
