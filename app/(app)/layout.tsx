import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="min-h-screen flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
