import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  assertAdminSupabaseEnv();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ── 데이터 병렬 조회 ─────────────────────────────────────────────
  const [
    { data: profile },
    { count: studentCount },
    { count: teacherCount },
    { count: parentCount },
    { count: classCount },
    { count: lectureCount },
    { count: assignmentCount },
    { count: submissionTotal },
    { count: submissionPending },
    { count: postCount },
    { count: recordCount },
  ] = await Promise.all([
    supabase.from("profiles").select("name, email, phone, role, created_at").eq("id", user.id).single(),
    adminSupabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    adminSupabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    adminSupabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "parent"),
    adminSupabase.from("classes").select("id", { count: "exact", head: true }),
    adminSupabase.from("lectures").select("id", { count: "exact", head: true }),
    adminSupabase.from("assignments").select("id", { count: "exact", head: true }),
    adminSupabase.from("submissions").select("id", { count: "exact", head: true }),
    adminSupabase.from("submissions").select("id", { count: "exact", head: true }).neq("status", "reviewed"),
    adminSupabase.from("posts").select("id", { count: "exact", head: true }),
    adminSupabase.from("class_records").select("id", { count: "exact", head: true }),
  ]);

  // ── Server Actions ───────────────────────────────────────────────

  async function updateProfile(formData: FormData) {
    "use server";
    assertAdminSupabaseEnv();
    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    if (!name) redirect("/admin/settings?status=name_required");
    const { error } = await adminSupabase
      .from("profiles")
      .update({ name, phone: phone || null })
      .eq("id", user!.id);
    if (error) redirect("/admin/settings?status=profile_error");
    revalidatePath("/admin/settings");
    redirect("/admin/settings?status=profile_ok");
  }

  async function changePassword(formData: FormData) {
    "use server";
    const password = (formData.get("password") as string)?.trim();
    const confirm = (formData.get("confirm") as string)?.trim();
    if (!password || password.length < 6) redirect("/admin/settings?status=pw_short");
    if (password !== confirm) redirect("/admin/settings?status=pw_mismatch");
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.auth.updateUser({ password });
    if (error) redirect("/admin/settings?status=pw_error");
    redirect("/admin/settings?status=pw_ok");
  }

  // ── Status 메시지 ────────────────────────────────────────────────

  const statusMessages: Record<string, { text: string; color: string }> = {
    profile_ok:    { text: "계정 정보가 저장되었습니다.", color: "bg-emerald-50 text-emerald-700" },
    profile_error: { text: "저장에 실패했습니다. 다시 시도해주세요.", color: "bg-red-50 text-red-700" },
    name_required: { text: "이름은 필수입니다.", color: "bg-amber-50 text-amber-700" },
    pw_ok:         { text: "비밀번호가 변경되었습니다.", color: "bg-emerald-50 text-emerald-700" },
    pw_short:      { text: "비밀번호는 6자 이상이어야 합니다.", color: "bg-amber-50 text-amber-700" },
    pw_mismatch:   { text: "비밀번호가 일치하지 않습니다.", color: "bg-amber-50 text-amber-700" },
    pw_error:      { text: "비밀번호 변경에 실패했습니다.", color: "bg-red-50 text-red-700" },
  };

  const msg = status ? statusMessages[status] : null;

  // ── 관리 화면 목록 (사이드바와 동일 구조) ──────────────────────────
  const adminScreens: Array<{
    group: string;
    items: Array<{
      label: string;
      href: string;
      count: number | null;
      unit?: string;
      alert?: boolean;
    }>;
  }> = [
    {
      group: "운영 관리",
      items: [
        { label: "대시보드",     href: "/admin/dashboard",   count: null },
        { label: "학생회원 관리", href: "/admin/students",    count: studentCount ?? 0, unit: "명" },
        { label: "강사 관리",    href: "/admin/teachers",    count: teacherCount ?? 0, unit: "명" },
        { label: "반 관리",      href: "/admin/classes",     count: classCount ?? 0,   unit: "개" },
        { label: "학부모 관리",  href: "/admin/parents",     count: parentCount ?? 0,  unit: "명" },
        { label: "수업기록",     href: "/admin/records",     count: recordCount ?? 0,  unit: "건" },
      ],
    },
    {
      group: "강의 콘텐츠",
      items: [
        { label: "강의 관리",  href: "/admin/lectures",    count: lectureCount ?? 0,    unit: "개" },
        { label: "과제 관리",  href: "/admin/assignments", count: assignmentCount ?? 0, unit: "개" },
        { label: "과제 제출",  href: "/admin/submissions", count: submissionTotal ?? 0, unit: "건" },
      ],
    },
    {
      group: "첨삭 & 성장",
      items: [
        { label: "첨삭 관리",    href: "/admin/feedback",   count: submissionPending ?? 0, unit: "건", alert: (submissionPending ?? 0) > 0 },
        { label: "성장지표",     href: "/admin/growth",     count: null },
        { label: "포트폴리오",   href: "/admin/portfolio",  count: null },
        { label: "학부모 리포트", href: "/admin/reports",   count: null },
      ],
    },
    {
      group: "기타",
      items: [
        { label: "게시판", href: "/admin/board", count: postCount ?? 0, unit: "개" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">설정</h1>
        <p className="mt-1 text-sm text-zinc-500">운영 현황 확인 및 관리자 계정을 관리합니다.</p>
      </div>

      {/* 상태 메시지 */}
      {msg && (
        <p className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.color}`}>
          {msg.text}
        </p>
      )}

      {/* ── 운영 현황 ── */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-zinc-800">운영 현황</h2>
        <p className="mt-0.5 text-xs text-zinc-400">현재 DB에 등록된 실시간 데이터입니다.</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "학생",     value: studentCount ?? 0,     unit: "명", color: "bg-indigo-50 text-indigo-700" },
            { label: "강사",     value: teacherCount ?? 0,     unit: "명", color: "bg-blue-50 text-blue-700" },
            { label: "학부모",   value: parentCount ?? 0,      unit: "명", color: "bg-violet-50 text-violet-700" },
            { label: "반",       value: classCount ?? 0,       unit: "개", color: "bg-emerald-50 text-emerald-700" },
            { label: "강의",     value: lectureCount ?? 0,     unit: "개", color: "bg-sky-50 text-sky-700" },
            { label: "과제",     value: assignmentCount ?? 0,  unit: "개", color: "bg-amber-50 text-amber-700" },
            { label: "제출물",   value: submissionTotal ?? 0,  unit: "건", color: "bg-zinc-100 text-zinc-700" },
            { label: "미검토",   value: submissionPending ?? 0, unit: "건", color: (submissionPending ?? 0) > 0 ? "bg-red-50 text-red-700" : "bg-zinc-100 text-zinc-500" },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${color}`}>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="mt-1 text-2xl font-bold">
                {value.toLocaleString()}
                <span className="ml-0.5 text-sm font-normal">{unit}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 관리 화면 확인 ── */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-zinc-800">관리 화면 확인</h2>
        <p className="mt-0.5 text-xs text-zinc-400">각 화면으로 바로 이동합니다.</p>

        <div className="mt-4 space-y-5">
          {adminScreens.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-2 text-xs font-semibold text-zinc-400">{group}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map(({ label, href, count, unit, alert }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span>{label}</span>
                    {count !== null && (
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          alert
                            ? "bg-red-100 text-red-600"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {count.toLocaleString()}{unit}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 내 계정 ── */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-zinc-800">내 계정</h2>
        <p className="mt-0.5 text-xs text-zinc-400">이름과 전화번호를 수정할 수 있습니다.</p>

        <form action={updateProfile} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이름</label>
            <input
              name="name"
              required
              defaultValue={profile?.name ?? ""}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이메일</label>
            <input
              defaultValue={profile?.email ?? user.email ?? ""}
              readOnly
              className="h-10 w-full rounded-lg border border-zinc-100 bg-zinc-50 px-3 text-sm text-zinc-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-zinc-400">이메일은 변경할 수 없습니다.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">전화번호</label>
            <input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              placeholder="010-0000-0000"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
            역할: <span className="font-semibold text-zinc-700">{profile?.role ?? "-"}</span>
            {profile?.created_at && (
              <>
                &nbsp;·&nbsp;가입일:{" "}
                <span className="font-semibold text-zinc-700">
                  {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                </span>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary">저장</Button>
          </div>
        </form>
      </Card>

      {/* ── 비밀번호 변경 ── */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-zinc-800">비밀번호 변경</h2>
        <p className="mt-0.5 text-xs text-zinc-400">새 비밀번호는 6자 이상이어야 합니다.</p>

        <form action={changePassword} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">새 비밀번호</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">비밀번호 확인</label>
            <input
              name="confirm"
              type="password"
              required
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary">변경</Button>
          </div>
        </form>
      </Card>

      {/* ── 시스템 정보 ── */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-zinc-800">시스템 정보</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">환경</dt>
            <dd className="font-medium text-zinc-700">{process.env.NODE_ENV}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Supabase URL</dt>
            <dd className="font-medium text-zinc-700">
              {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").split(".")[0] + ".supabase.co"}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
