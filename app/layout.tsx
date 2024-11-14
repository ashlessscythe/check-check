import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Building Check-In",
  description:
    "Building access tracking system for daily operations and emergency preparedness",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
