import { Header } from "@/components/layout/Header";
import { SeekerSidebar } from "@/components/layout/SeekerSidebar";
import { Footer } from "@/components/layout/Footer";

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex max-w-7xl flex-1 gap-8 px-4 py-8">
        <SeekerSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
