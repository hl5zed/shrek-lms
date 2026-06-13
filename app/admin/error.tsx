"use client";

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: 32, fontFamily: "monospace" }}>
      <h2>Admin Error (임시 디버그)</h2>
      <pre style={{ background: "#fee", padding: 16, whiteSpace: "pre-wrap" }}>
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
    </div>
  );
}
