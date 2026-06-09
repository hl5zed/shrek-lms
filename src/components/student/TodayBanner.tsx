type TodayBannerProps = {
  message: string;
  attendance: string;
};

export default function TodayBanner({ message, attendance }: TodayBannerProps) {
  return (
    <div className="rounded-2xl bg-[#EEF1FF] p-4">
      <p className="text-xs font-semibold text-[#3A4BFF]">오늘의 학습 안내</p>
      <p className="mt-1 text-sm text-[#161D55]">{message}</p>
      <p className="mt-2 text-xs text-[#6470BF]">출석 상태: {attendance}</p>
    </div>
  );
}

