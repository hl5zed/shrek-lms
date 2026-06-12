"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

// 스트리밍 설정 화면에서 사용하는 강의 항목 타입
type StreamRow = {
  id: string;
  title: string;
  className: string;
  videoUrl: string;
  provider: string;
  createdAtText: string;
};

function detectProvider(url: string): string {
  try {
    const h = new URL(url).hostname.toLowerCase();
    if (h.includes("youtube.com") || h.includes("youtu.be")) return "YouTube";
    if (h.includes("vimeo.com")) return "Vimeo";
    if (h.includes("bunny.net") || h.includes("b-cdn.net")) return "Bunny Stream";
  } catch {
    /* noop */
  }
  return "외부 스트리밍";
}

// 인라인 편집 상태를 관리하는 행 컴포넌트
function StreamRow({
  row,
  onSaved,
}: {
  row: StreamRow;
  onSaved: (id: string, newUrl: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(row.videoUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/lectures/update-video-url", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, video_url: url.trim() || null }),
      });
      if (!res.ok) throw new Error("저장 실패");
      onSaved(row.id, url.trim());
      setEditing(false);
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="py-3 pr-4 text-sm font-medium text-zinc-800">{row.title}</td>
      <td className="py-3 pr-4 text-sm text-zinc-500">{row.className}</td>
      <td className="py-3 pr-4">
        {editing ? (
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              autoFocus
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        ) : (
          <span className="block max-w-xs truncate text-sm text-indigo-600">
            {row.videoUrl || <span className="text-zinc-400">URL 없음</span>}
          </span>
        )}
      </td>
      <td className="py-3 pr-4">
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
          {row.videoUrl ? detectProvider(row.videoUrl) : "—"}
        </span>
      </td>
      <td className="py-3 text-right">
        {editing ? (
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {saving ? "저장 중…" : "저장"}
            </button>
            <button
              onClick={() => { setEditing(false); setUrl(row.videoUrl); setError(""); }}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            URL 수정
          </button>
        )}
      </td>
    </tr>
  );
}

export default function StreamingSettingsPage() {
  const [rows, setRows] = useState<StreamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 강의 목록과 반 정보를 함께 조회합니다
    fetch("/api/admin/lectures/list")
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("데이터를 불러오지 못했습니다.");
        setLoading(false);
      });
  }, []);

  function handleSaved(id: string, newUrl: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, videoUrl: newUrl, provider: detectProvider(newUrl) } : r))
    );
  }

  const streamingRows = rows.filter((r) => r.videoUrl);
  const noUrlRows = rows.filter((r) => !r.videoUrl);

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/admin/lectures"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 강의 콘텐츠 관리
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">스트리밍 설정</h1>
        <p className="mt-1 text-sm text-zinc-500">
          강의별 영상 URL을 확인하고 수정합니다. YouTube · Vimeo · Bunny Stream URL을 지원합니다.
        </p>
      </div>

      {loading && (
        <Card className="p-8 text-center text-sm text-zinc-400">데이터를 불러오는 중…</Card>
      )}
      {error && (
        <Card className="p-6 text-sm text-red-600">{error}</Card>
      )}

      {!loading && !error && (
        <>
          {/* URL이 등록된 강의 목록 */}
          <Card className="mb-6 overflow-hidden p-0">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-700">
                스트리밍 등록 강의{" "}
                <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                  {streamingRows.length}
                </span>
              </h2>
            </div>
            {streamingRows.length === 0 ? (
              <p className="px-5 py-8 text-sm text-zinc-400 text-center">
                영상 URL이 등록된 강의가 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      <th className="px-5 py-3 pr-4">강의명</th>
                      <th className="py-3 pr-4">반</th>
                      <th className="py-3 pr-4">영상 URL</th>
                      <th className="py-3 pr-4">플랫폼</th>
                      <th className="py-3 pr-5 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="px-5">
                    {streamingRows.map((row) => (
                      <StreamRow key={row.id} row={row} onSaved={handleSaved} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* URL 미등록 강의 */}
          {noUrlRows.length > 0 && (
            <Card className="overflow-hidden p-0">
              <div className="border-b border-zinc-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-zinc-700">
                  URL 미등록 강의{" "}
                  <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                    {noUrlRows.length}
                  </span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      <th className="px-5 py-3 pr-4">강의명</th>
                      <th className="py-3 pr-4">반</th>
                      <th className="py-3 pr-4">영상 URL</th>
                      <th className="py-3 pr-4">플랫폼</th>
                      <th className="py-3 pr-5 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="px-5">
                    {noUrlRows.map((row) => (
                      <StreamRow key={row.id} row={row} onSaved={handleSaved} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      <Card className="mt-6 border-indigo-100 bg-indigo-50 p-4">
        <p className="text-sm text-indigo-700">
          지원 플랫폼: YouTube, Vimeo, Bunny Stream. URL은 등록된 로그인 사용자만 강의 페이지에서 접근할 수 있습니다.
        </p>
      </Card>
    </div>
  );
}
