type AudioPlayerProps = {
  src?: string | null;
};

export default function AudioPlayer({ src }: AudioPlayerProps) {
  if (!src) {
    return (
      <div className="rounded-xl border border-[#D4D9F5] p-3">
        <p className="text-xs text-[#6470BF]">음성 피드백</p>
        <p className="mt-2 text-sm text-[#4A55A8]">음성 첨삭은 아직 준비중입니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#D4D9F5] p-3">
      <p className="text-xs text-[#6470BF]">음성 피드백</p>
      <audio controls className="mt-2 w-full">
        <source src={src} type="audio/mpeg" />
      </audio>
    </div>
  );
}

