import "../styles/globals.css";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/app/providers";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/nav/app-sidebar";

const inter = Inter({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
})
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.className} h-full antialiased`}>
            <body>
                <QueryProvider>
                    <TooltipProvider>
                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarInset className="p-4 flex flex-col gap-4 bg-zinc-200">
                                {children}
                            </SidebarInset>
                        </SidebarProvider>
                    </TooltipProvider>
                    <Toaster />
                </QueryProvider>
            </body>
        </html>
    );
}
