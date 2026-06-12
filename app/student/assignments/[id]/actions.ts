"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MIN_TEXT_LENGTH = 50;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];
// 파일 제출 로직은 이 파일에 통합되어 있습니다.
// 별도 upload-action.ts는 사용하지 않습니다.

type UploadFileMeta = {
  type: string;
  name: string;
  path: string;
  bucket: string;
  size: number;
  uploaded_at: string;
};

function getExtension(name: string): string {
  const match = name.match(/\.([a-zA-Z0-9]+)$/);
  return match ? `.${match[1].toLowerCase()}` : "";
}

function isAllowedFile(file: File): boolean {
  if (ALLOWED_MIME_TYPES.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

async function verifyStudentAssignmentAccess(assignmentId: string, userId: string) {
  const supabase = await createClient();
  const { data: classLinks } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", userId);
  const classIds = (classLinks ?? []).map((row) => row.class_id);

  if (classIds.length === 0) {
    return { ok: false as const };
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, class_id")
    .eq("id", assignmentId)
    .in("class_id", classIds)
    .single();

  return { ok: Boolean(assignment) as boolean };
}

async function uploadSubmissionFile(
  file: File,
  assignmentId: string,
  studentId: string,
): Promise<{ ok: true; meta: UploadFileMeta } | { ok: false; reason: "bucket_missing" | "upload_error" }> {
  const supabase = await createClient();
  const timestamp = Date.now();
  const ext = getExtension(file.name);
  const objectPath = `${studentId}/${assignmentId}/${timestamp}${ext}`;
  const bucketCandidates = ["submissions"] as const;

  let sawBucketNotFound = false;

  for (const bucket of bucketCandidates) {
    const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

    if (!error) {
      return {
        ok: true,
        meta: {
          type: file.type || "application/octet-stream",
          name: file.name,
          path: objectPath,
          bucket,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        },
      };
    }

    const message = (error.message ?? "").toLowerCase();
    if (message.includes("bucket") && message.includes("not")) {
      sawBucketNotFound = true;
      continue;
    }

    return { ok: false, reason: "upload_error" };
  }

  return { ok: false, reason: sawBucketNotFound ? "bucket_missing" : "upload_error" };
}

export async function submitStudentAssignment(assignmentId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await verifyStudentAssignmentAccess(assignmentId, user.id);
  if (!access.ok) {
    redirect(`/student/assignments/${assignmentId}?status=forbidden`);
  }

  const contentText = String(formData.get("content_text") ?? "").trim();
  const wordCount = contentText.length;
  const pureCount = contentText.replace(/\s/g, "").length;

  if (wordCount < MIN_TEXT_LENGTH) {
    redirect(`/student/assignments/${assignmentId}?status=too_short`);
  }

  const { data: existing } = await supabase
    .from("submissions")
    .select("id")
    .eq("assignment_id", assignmentId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("submissions").insert({
      assignment_id: assignmentId,
      student_id: user.id,
      content_text: contentText,
      word_count: wordCount,
      word_count_pure: pureCount,
      status: "submitted",
    });

    if (error) {
      redirect(`/student/assignments/${assignmentId}?status=error`);
    }
  } else {
    const { error } = await supabase
      .from("submissions")
      .update({
        content_text: contentText,
        word_count: wordCount,
        word_count_pure: pureCount,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      redirect(`/student/assignments/${assignmentId}?status=error`);
    }
  }

  redirect(`/student/assignments/${assignmentId}?status=submitted`);
}

export async function submitStudentAssignmentFile(assignmentId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await verifyStudentAssignmentAccess(assignmentId, user.id);
  if (!access.ok) {
    redirect(`/student/assignments/${assignmentId}?status=forbidden`);
  }

  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status, file_urls")
    .eq("assignment_id", assignmentId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing?.status === "reviewed") {
    redirect(`/student/assignments/${assignmentId}?status=readonly`);
  }

  const file = formData.get("submission_file");
  if (!(file instanceof File) || file.size <= 0) {
    redirect(`/student/assignments/${assignmentId}?status=file_required`);
  }

  if (!isAllowedFile(file)) {
    redirect(`/student/assignments/${assignmentId}?status=invalid_file`);
  }

  if (file.size > MAX_FILE_BYTES) {
    redirect(`/student/assignments/${assignmentId}?status=file_too_large`);
  }

  const uploadResult = await uploadSubmissionFile(file, assignmentId, user.id);
  if (!uploadResult.ok) {
    redirect(
      `/student/assignments/${assignmentId}?status=${uploadResult.reason === "bucket_missing" ? "bucket_missing" : "upload_error"}`,
    );
  }

  const nextFileUrls = [
    ...((Array.isArray(existing?.file_urls) ? existing?.file_urls : []) as UploadFileMeta[]),
    uploadResult.meta,
  ];

  if (!existing) {
    const { error } = await supabase.from("submissions").insert({
      assignment_id: assignmentId,
      student_id: user.id,
      file_urls: nextFileUrls,
      status: "submitted",
    });

    if (error) {
      redirect(`/student/assignments/${assignmentId}?status=error`);
    }
  } else {
    const { error } = await supabase
      .from("submissions")
      .update({
        file_urls: nextFileUrls,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      redirect(`/student/assignments/${assignmentId}?status=error`);
    }
  }

  redirect(`/student/assignments/${assignmentId}?status=submitted`);
}

