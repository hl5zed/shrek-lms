"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SubmissionRow = {
  id: string;
  status: string | null;
  file_urls: unknown[] | null;
};

function toFileType(mimeType: string): "image_pdf" | "file" {
  return mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "application/pdf"
    ? "image_pdf"
    : "file";
}

function toFileUrlArray(value: unknown): Array<{ type: "image_pdf" | "file"; url: string; name: string }> {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "object" && item !== null) as Array<{
    type: "image_pdf" | "file";
    url: string;
    name: string;
  }>;
}

export async function submitTextAction(assignmentId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const text = String(formData.get("content_text") ?? "");
  const wordCount = text.length;
  const wordCountPure = text.replace(/\s/g, "").length;

  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("assignment_id", assignmentId)
    .eq("student_id", user.id)
    .maybeSingle<SubmissionRow>();

  if (existing) {
    if (existing.status === "reviewed") return;

    await supabase
      .from("submissions")
      .update({
        content_text: text,
        word_count: wordCount,
        word_count_pure: wordCountPure,
        updated_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("submissions").insert({
      assignment_id: assignmentId,
      student_id: user.id,
      content_text: text,
      word_count: wordCount,
      word_count_pure: wordCountPure,
      status: "submitted",
    });
  }

  revalidatePath(`/student/assignments/${assignmentId}`);
}

export async function submitFileAction(
  assignmentId: string,
  formData: FormData,
  bucketName = "submissions",
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const file = formData.get("submission_file");
  if (!(file instanceof File) || file.size === 0) return;

  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);
  if (!allowedMimeTypes.has(file.type)) return;

  const path = `${user.id}/${assignmentId}/${Date.now()}_${file.name}`;
  const fileBuffer = await file.arrayBuffer();

  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from(bucketName)
    .upload(path, fileBuffer, { contentType: file.type, upsert: false });
  if (uploadError || !uploadData) return;

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uploadData.path);
  const publicUrl = publicUrlData.publicUrl;
  if (!publicUrl) return;

  const fileEntry = {
    type: toFileType(file.type),
    url: publicUrl,
    name: file.name,
  };

  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status, file_urls")
    .eq("assignment_id", assignmentId)
    .eq("student_id", user.id)
    .maybeSingle<SubmissionRow>();

  if (existing) {
    if (existing.status === "reviewed") return;

    const nextFileUrls = [...toFileUrlArray(existing.file_urls), fileEntry];
    await supabase
      .from("submissions")
      .update({
        file_urls: nextFileUrls,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("submissions").insert({
      assignment_id: assignmentId,
      student_id: user.id,
      content_text: "",
      file_urls: [fileEntry],
      status: "submitted",
    });
  }

  revalidatePath(`/student/assignments/${assignmentId}`);
}
