"use client";

type Props = {
  action: (formData: FormData) => Promise<void>;
  teacherId: string;
  teacherName: string;
};

export default function DeleteTeacherButton({ action, teacherId, teacherName }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `"${teacherName}" 강사를 삭제하시겠습니까?\n담당 반 연결 등 관련 데이터도 함께 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="teacherId" value={teacherId} />
      <button
        type="submit"
        className="h-8 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
      >
        삭제
      </button>
    </form>
  );
}
