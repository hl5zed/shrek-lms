type CommentBoxProps = {
  comment: string | null;
};

export default function CommentBox({ comment }: CommentBoxProps) {
  return (
    <div className="rounded-xl border border-[#D4D9F5] bg-[#F5F7FF] p-4">
      <p className="text-xs font-semibold text-[#4A55A8]">강사 코멘트</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-[#161D55]">
        {comment || "아직 작성된 종합 코멘트가 없습니다."}
      </p>
    </div>
  );
}

