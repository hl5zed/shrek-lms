"use client";

type Props = {
  action: (formData: FormData) => Promise<void>;
  parentId: string;
  parentName: string;
};

export default function DeleteParentButton({ action, parentId, parentName }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `"${parentName}" 학부모를 삭제하시겠습니까?\n자녀 연결 및 알림 내역도 함께 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="parentId" value={parentId} />
      <button
        type="submit"
        className="h-8 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
      >
        삭제
      </button>
    </form>
  );
}
