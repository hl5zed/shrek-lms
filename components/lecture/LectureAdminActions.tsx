"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";

type LectureAdminActionsProps = {
  lectureId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  materialUrl?: string;
};

export default function LectureAdminActions({
  lectureId,
  title,
  description,
  videoUrl,
  materialUrl,
}: LectureAdminActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description ?? "");
  const [editVideoUrl, setEditVideoUrl] = useState(videoUrl ?? "");
  const [editMaterialUrl, setEditMaterialUrl] = useState(materialUrl ?? "");

  function openModal() {
    setEditTitle(title);
    setEditDescription(description ?? "");
    setEditVideoUrl(videoUrl ?? "");
    setEditMaterialUrl(materialUrl ?? "");
    setErrorMessage("");
    setIsModalOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/admin/lectures/${lectureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          video_url: editVideoUrl || null,
          material_url: editMaterialUrl || null,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "수정에 실패했습니다.");
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/admin/lectures/${lectureId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "삭제에 실패했습니다.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openModal}
          className="rounded border border-zinc-200 px-2 py-1 text-xs"
        >
          수정
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
      </div>

      {errorMessage ? <p className="mt-1 text-xs text-red-600">{errorMessage}</p> : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="flex min-h-full items-center justify-center p-4">
            <Card className="w-full max-w-xl bg-white p-5">
              <h3 className="mb-4 text-base font-semibold text-zinc-900">강의 수정</h3>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">제목</label>
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">설명</label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    className="w-full resize-y rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">영상 URL</label>
                  <input
                    value={editVideoUrl}
                    onChange={(event) => setEditVideoUrl(event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">자료 URL</label>
                  <input
                    value={editMaterialUrl}
                    onChange={(event) => setEditMaterialUrl(event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  {isSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
