import "../styles/globals.css";
import { Inter } from "next/font/google";
import { QueryProvider } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body>
        <QueryProvider>
          <main className={`${inter.className} h-full antialiased`}>{children}</main>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
