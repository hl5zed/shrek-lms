import Button from "@/components/ui/Button";

type TopHeaderProps = {
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
};

export default function TopHeader({
  title,
  description,
  primaryLabel,
  primaryHref,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-neutral-200)] bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-neutral-1000)]">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{description}</p>
          ) : null}
        </div>
        {primaryLabel && primaryHref ? (
          <a href={primaryHref}>
            <Button variant="primary">{primaryLabel}</Button>
          </a>
        ) : null}
      </div>
    </header>
  );
}
