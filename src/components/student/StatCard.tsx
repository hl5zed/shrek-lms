type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="min-w-0 rounded-xl border border-[#D4D9F5] bg-white p-3 sm:p-4">
      <p className="truncate text-xs text-[#6470BF]">{label}</p>
      <p className="mt-1 truncate text-lg font-bold text-[#06091F] sm:text-xl">{value}</p>
      {helper ? <p className="mt-1 text-xs text-[#8891D4]">{helper}</p> : null}
    </div>
  );
}

