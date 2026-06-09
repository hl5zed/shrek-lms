type RowItemProps = {
  label: string;
  value: string;
};

export default function RowItem({ label, value }: RowItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#EAEDFA] py-2 last:border-b-0">
      <span className="shrink-0 text-sm text-[#4A55A8]">{label}</span>
      <span className="max-w-[70%] text-right text-sm font-semibold text-[#06091F] break-words">{value}</span>
    </div>
  );
}

