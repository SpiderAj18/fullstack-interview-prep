export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,148,136,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.14),transparent_35%),linear-gradient(180deg,#f8fbfa,#eef5f3)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl"
      />
      <div className="relative z-10 w-full max-w-md animate-scale-in">{children}</div>
    </div>
  );
}
