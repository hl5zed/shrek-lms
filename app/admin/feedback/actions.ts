"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteSubmission(submissionId: string) {
  const supabase = await createClient();

  // feedbacks 먼저 삭제 (FK 제약)
  await supabase.from("feedbacks").delete().eq("submission_id", submissionId);

  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/feedback");
}
