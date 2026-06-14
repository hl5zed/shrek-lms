"use client";

type Props = {
  action: (formData: FormData) => Promise<void>;
  studentId: string;
  studentName: string;
};

export default function DeleteStudentButton({ action, studentId, studentName }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `"${studentName}" 학생을 삭제하시겠습니까?\n관련 데이터(제출물, 알림 등)도 함께 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="studentId" value={studentId} />
      <button
        type="submit"
        className="h-8 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
      >
        삭제
      </button>
    </form>
  );
}
