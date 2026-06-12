"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AudioUploadField() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState<string>("");
  const hiddenRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 허용 타입 검사
    const allowed = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm"];
    if (!allowed.includes(file.type)) {
      setStatus("error");
      setFileName("MP3·M4A·WAV·OGG·WEBM 파일만 업로드할 수 있습니다.");
      return;
    }

    setStatus("uploading");
    setFileName(file.name);

    const path = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    const { data, error } = await supabase.storage
      .from("lecture-audio")
      .upload(path, file, { upsert: false });

    if (error || !data) {
      // 버킷 미존재 vs 권한 오류를 구분해서 표시
      const msg = error?.message ?? "알 수 없는 오류";
      const hint =
        msg.includes("Bucket not found") || msg.includes("bucket")
          ? "lecture-audio 버킷이 존재하지 않습니다. Supabase SQL Editor에서 버킷을 생성해 주세요."
          : msg.includes("violates row-level security") || msg.includes("policy")
          ? "업로드 권한이 없습니다. Supabase Storage 정책을 확인해 주세요."
          : "업로드 실패: " + msg;
      setStatus("error");
      setFileName(hint);
      console.error("[AudioUploadField] upload error:", error);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("lecture-audio")
      .getPublicUrl(data.path);

    if (hiddenRef.current) hiddenRef.current.value = urlData.publicUrl;
    setStatus("done");
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
        음성 파일
      </label>
      {/* 실제 URL은 hidden input으로 서버 액션에 전달 */}
      <input type="hidden" name="audio_url" ref={hiddenRef} />

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-zinc-300 px-4 py-3 transition hover:border-indigo-400 hover:bg-indigo-50">
        <span className="text-lg">🎵</span>
        <span className="text-sm text-zinc-500">
          {status === "idle" && "MP3, M4A, WAV, OGG, WEBM 파일을 선택하세요"}
          {status === "uploading" && `업로드 중… (${fileName})`}
          {status === "done" && `✅ ${fileName}`}
          {status === "error" && `❌ ${fileName}`}
        </span>
        <input
          type="file"
          accept="audio/*"
          className="sr-only"
          onChange={handleChange}
          disabled={status === "uploading"}
        />
      </label>
      <p className="mt-1 text-xs text-zinc-400">
        파일 선택 시 즉시 업로드되며, 등록하기 버튼을 누르면 강의에 연결됩니다.
      </p>
    </div>
  );
}
