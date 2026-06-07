import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/lms/ProgressBar";
import { LmsMockData } from "@/lib/lms/types";

type ParentReportPanelProps = {
  data: LmsMockData;
};

export default function ParentReportPanel({ data }: ParentReportPanelProps) {
  const report = data.parentReport;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap justify-end">
        <Button variant="primary">리포트 출력</Button>
      </div>
      <Card className="p-6">
        <h3 className="text-lg font-bold text-[var(--color-neutral-1000)]">{report.studentName} 학부모 리포트</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-[var(--color-neutral-500)]">출석률 {report.attendanceRate}%</p>
            <ProgressBar value={report.attendanceRate} />
          </div>
          <div>
            <p className="mb-1 text-xs text-[var(--color-neutral-500)]">과제 제출률 {report.assignmentRate}%</p>
            <ProgressBar value={report.assignmentRate} />
          </div>
          <div>
            <p className="mb-1 text-xs text-[var(--color-neutral-500)]">첨삭 완료 {report.feedbackDone}건</p>
            <ProgressBar value={Math.min(100, report.feedbackDone * 8)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-[var(--color-neutral-500)]">종합 성장 점수 {report.growthScore}</p>
            <ProgressBar value={report.growthScore} />
          </div>
        </div>
      </Card>
    </section>
  );
}
