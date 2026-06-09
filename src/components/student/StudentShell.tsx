import { createClient } from "@/lib/supabase/server";
import StudentBottomNav from "./StudentBottomNav";
import StudentHeader from "./StudentHeader";

type StudentShellProps = {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  showGreeting?: boolean;
};

export default async function StudentShell({
  title,
  children,
  backHref,
  showGreeting = false,
}: StudentShellProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("name, email, role")
        .eq("id", user.id)
        .single()
    : { data: null };

  const studentName = profile?.name ?? "학생";
  const studentEmail = profile?.email ?? "";

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <StudentHeader
        title={title}
        backHref={backHref}
        studentName={studentName}
        studentEmail={studentEmail}
        showGreeting={showGreeting}
      />
      <main className="mx-auto w-full max-w-sm space-y-4 px-4 py-4 pb-28">
        {children}
      </main>
      <StudentBottomNav />
    </div>
  );
}

