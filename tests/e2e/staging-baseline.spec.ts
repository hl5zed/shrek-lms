import { expect, test, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type RoleKey = "admin" | "teacherA" | "studentA" | "parentA";

type RoleCredential = {
  email: string;
  password: string;
};

type ConsoleAndNetworkWatch = {
  detach: () => void;
  getConsoleErrors: () => string[];
  getHttpErrors: () => string[];
  getAuthEvents: () => string[];
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`필수 환경변수 누락: ${name}`);
  }
  return value;
}

function loadEnvLocalIfExists(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const raw = readFileSync(envPath, "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx <= 0) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadCredential(role: RoleKey): RoleCredential {
  const upper = role.toUpperCase();
  return {
    email: requiredEnv(`E2E_${upper}_EMAIL`),
    password: requiredEnv(`E2E_${upper}_PASSWORD`),
  };
}

function resolveUrl(path: string): string {
  const baseUrl = requiredEnv("STAGING_BASE_URL");
  return new URL(path, baseUrl).toString();
}

function installConsoleAndNetworkWatch(page: Page): ConsoleAndNetworkWatch {
  const consoleErrors: string[] = [];
  const httpErrors: string[] = [];
  const authEvents: string[] = [];

  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  };

  const onResponse = (response: { status: () => number; url: () => string }) => {
    const status = response.status();
    const url = response.url();
    if ([400, 401, 403, 500].includes(status)) {
      httpErrors.push(`${status} ${url}`);
    }
    if (url.includes("/auth/v1/")) {
      authEvents.push(`response ${status} ${url}`);
    }
  };

  const onRequestFailed = (request: { url: () => string; failure: () => { errorText?: string } | null }) => {
    const url = request.url();
    if (url.includes("/auth/v1/")) {
      authEvents.push(`requestfailed ${url} ${request.failure()?.errorText ?? "unknown"}`);
    }
  };

  page.on("console", onConsole);
  page.on("response", onResponse);
  page.on("requestfailed", onRequestFailed);

  return {
    detach: () => {
      page.off("console", onConsole);
      page.off("response", onResponse);
      page.off("requestfailed", onRequestFailed);
    },
    getConsoleErrors: () => consoleErrors,
    getHttpErrors: () => httpErrors,
    getAuthEvents: () => authEvents,
  };
}

async function login(page: Page, credential: RoleCredential): Promise<void> {
  await page.goto(resolveUrl("/login"));
  await page.getByPlaceholder("example@email.com").fill(credential.email);
  await page.getByPlaceholder("••••••••").fill(credential.password);
  await page.getByRole("button", { name: "로그인" }).click();
}

async function assertLoginRedirectOrExplain(
  page: Page,
  rolePrefix: "admin" | "teacher" | "student" | "parent",
  watch: ConsoleAndNetworkWatch
): Promise<void> {
  const rolePathRegex = new RegExp(`/${rolePrefix}/`);
  const loginError = page.getByText("이메일 또는 비밀번호를 확인해주세요.");

  const result = await Promise.race([
    page
      .waitForURL(rolePathRegex, { timeout: 12000 })
      .then(() => "role-home" as const),
    loginError
      .waitFor({ state: "visible", timeout: 12000 })
      .then(() => "login-error" as const),
  ]).catch(() => "timeout" as const);

  if (result !== "role-home") {
    const currentUrl = page.url();
    const errorVisible = await loginError.isVisible().catch(() => false);
    const authEvents = watch.getAuthEvents();
    throw new Error(
      [
        `로그인 후 역할 페이지 이동 실패: ${rolePrefix}`,
        `result=${result}`,
        `currentUrl=${currentUrl}`,
        `loginErrorVisible=${errorVisible}`,
        `authEvents=${authEvents.length > 0 ? authEvents.join(" | ") : "none"}`,
      ].join(" ; ")
    );
  }
}

async function logout(page: Page): Promise<void> {
  const logoutButton = page.getByRole("button", { name: /로그아웃/ });
  if (await logoutButton.count()) {
    await logoutButton.first().click();
    await expect(page).toHaveURL(/\/login/);
  }
}

function expectNoClientErrors(
  watch: ConsoleAndNetworkWatch,
  contextLabel: string
): void {
  const consoleErrors = watch.getConsoleErrors();
  const httpErrors = watch.getHttpErrors();
  expect.soft(
    consoleErrors,
    `[${contextLabel}] console error 발생`
  ).toEqual([]);
  expect.soft(
    httpErrors,
    `[${contextLabel}] 400/401/403/500 응답 감지`
  ).toEqual([]);
}

test.describe("Round 1 staging baseline QA", () => {
  test.beforeAll(() => {
    loadEnvLocalIfExists();
    requiredEnv("STAGING_BASE_URL");
    requiredEnv("E2E_ADMIN_EMAIL");
    requiredEnv("E2E_ADMIN_PASSWORD");
    requiredEnv("E2E_TEACHERA_EMAIL");
    requiredEnv("E2E_TEACHERA_PASSWORD");
    requiredEnv("E2E_STUDENTA_EMAIL");
    requiredEnv("E2E_STUDENTA_PASSWORD");
    requiredEnv("E2E_PARENTA_EMAIL");
    requiredEnv("E2E_PARENTA_PASSWORD");
  });

  test("admin 로그인 및 /admin/* 접근", async ({ page }) => {
    const watch = installConsoleAndNetworkWatch(page);
    const credential = loadCredential("admin");

    await login(page, credential);
    await assertLoginRedirectOrExplain(page, "admin", watch);

    await page.goto(resolveUrl("/admin/dashboard"));
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto(resolveUrl("/admin/students"));
    await expect(page).toHaveURL(/\/admin\/students/);

    expectNoClientErrors(watch, "admin");
    await logout(page);
    watch.detach();
  });

  test("teacher A 로그인 및 /teacher/* + lectures/feedback 화면 접근", async ({ page }) => {
    const watch = installConsoleAndNetworkWatch(page);
    const credential = loadCredential("teacherA");

    await login(page, credential);
    await assertLoginRedirectOrExplain(page, "teacher", watch);

    await page.goto(resolveUrl("/teacher/dashboard"));
    await expect(page).toHaveURL(/\/teacher\/dashboard/);
    await expect(page.getByRole("heading", { name: "강사 대시보드", exact: true })).toBeVisible();

    await page.goto(resolveUrl("/teacher/lectures"));
    await expect(page).toHaveURL(/\/teacher\/lectures/);
    await expect(page.getByRole("heading", { name: "강의", exact: true })).toBeVisible();

    await page.goto(resolveUrl("/teacher/submissions"));
    await expect(page).toHaveURL(/\/teacher\/submissions/);
    await expect(page.getByRole("heading", { name: "제출함", exact: true })).toBeVisible();

    expectNoClientErrors(watch, "teacherA");
    await logout(page);
    watch.detach();
  });

  test("student A 로그인 및 /student/* + lectures/feedback 화면 접근", async ({ page }) => {
    const watch = installConsoleAndNetworkWatch(page);
    const credential = loadCredential("studentA");

    await login(page, credential);
    await assertLoginRedirectOrExplain(page, "student", watch);

    await page.goto(resolveUrl("/student/dashboard"));
    await expect(page).toHaveURL(/\/student\/dashboard/);
    await expect(page.getByText(/안녕하세요,\s*.*님/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "수강 중 강의", exact: true })).toBeVisible();

    await page.goto(resolveUrl("/student/lectures"));
    await expect(page).toHaveURL(/\/student\/lectures/);
    await expect(page.getByRole("heading", { name: "강의", exact: true })).toBeVisible();

    await page.goto(resolveUrl("/student/feedback"));
    await expect(page).toHaveURL(/\/student\/feedback/);
    await expect(page.getByRole("heading", { name: "첨삭 결과", exact: true })).toBeVisible();

    expectNoClientErrors(watch, "studentA");
    await logout(page);
    watch.detach();
  });

  test("parent A 로그인 및 /parent/* + feedback 화면 접근", async ({ page }) => {
    const watch = installConsoleAndNetworkWatch(page);
    const credential = loadCredential("parentA");

    await login(page, credential);
    await assertLoginRedirectOrExplain(page, "parent", watch);

    await page.goto(resolveUrl("/parent/dashboard"));
    await expect(page).toHaveURL(/\/parent\/dashboard/);
    await expect(page.getByRole("heading", { name: "학부모 대시보드", exact: true })).toBeVisible();

    await page.goto(resolveUrl("/parent/feedback"));
    await expect(page).toHaveURL(/\/parent\/feedback/);
    await expect(page.getByRole("heading", { name: "첨삭 결과", exact: true })).toBeVisible();

    expectNoClientErrors(watch, "parentA");
    await logout(page);
    watch.detach();
  });

  test("logged-out 보호 페이지 접근 차단", async ({ page }) => {
    const watch = installConsoleAndNetworkWatch(page);

    await page.goto(resolveUrl("/teacher/dashboard"));
    await expect(page).toHaveURL(/\/login/);

    await page.goto(resolveUrl("/admin/dashboard"));
    await expect(page).toHaveURL(/\/login/);

    await page.goto(resolveUrl("/student/dashboard"));
    await expect(page).toHaveURL(/\/login/);

    await page.goto(resolveUrl("/parent/dashboard"));
    await expect(page).toHaveURL(/\/login/);

    expectNoClientErrors(watch, "logged-out");
    watch.detach();
  });
});
