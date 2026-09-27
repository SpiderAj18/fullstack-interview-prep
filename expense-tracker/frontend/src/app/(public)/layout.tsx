export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#ccfbf1,_#f8fafc_55%)] p-4">
      {children}
    </div>
  );
}
