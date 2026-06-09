type StudentCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function StudentCard({ children, className = "" }: StudentCardProps) {
  return (
    <section className={`rounded-2xl border border-[#D4D9F5] bg-white p-4 ${className}`}>
      {children}
    </section>
  );
}

