import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/nav/app-sidebar";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col gap-4 bg-zinc-200 p-4">{children}</SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </main>
  );
}
