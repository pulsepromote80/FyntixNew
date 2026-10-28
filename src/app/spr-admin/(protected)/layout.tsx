import { Navbar } from "@/spr-admin/components/layout/Navbar";
import { Sidebar } from "@/spr-admin/components/layout/Sidebar";
import { MobileSidebar } from "@/spr-admin/components/layout/MobileSidebar";
import { Footer } from "@/spr-admin/components/layout/Footer";
import { IdleLogout } from "@/spr-admin/components/auth/IdleLogout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FA]">
      <IdleLogout />
      <Sidebar />
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col h-screen">
        <Navbar />

        {/* Main Content  */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FAF6EC] p-2 sm:p-4">
          {children}
        </main>

        {/* Footer - */}
        <Footer />
      </div>
    </div>
  );
}