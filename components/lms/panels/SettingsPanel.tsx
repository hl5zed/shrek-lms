import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function SettingsPanel() {
  return (
    <section className="grid grid-cols-2 gap-4">
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">기본 학원 정보</h3>
        <div className="mt-3 space-y-2 text-sm">
          <input className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] px-3" defaultValue="논술마루 본원" />
          <input className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] px-3" defaultValue="02-1234-5678" />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">강사 관리</h3>
        <div className="mt-3 space-y-2 text-sm text-[var(--color-neutral-700)]">
          <p>- 이수정 (고2 심화)</p>
          <p>- 정하늘 (고1 기초)</p>
          <p>- 한지민 (중3 예비)</p>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">반/수업 분류 관리</h3>
        <div className="mt-3 space-y-2 text-sm">
          <input className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] px-3" defaultValue="고2 심화 A" />
          <input className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] px-3" defaultValue="고1 기초 B" />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">알림/리포트 설정</h3>
        <div className="mt-3 space-y-2 text-sm text-[var(--color-neutral-700)]">
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 과제 마감 24시간 전 알림</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 학부모 주간 리포트 자동 발송</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> 첨삭 완료 즉시 알림</label>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="primary">설정 저장</Button>
        </div>
      </Card>
    </section>
  );
}
