import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TimerProvider } from "@/contexts/timer-context";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taskery",
  description: "Project Management for High Performers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${nunito.variable} font-sans antialiased text-lg md:text-xl`}
      >
        <TimerProvider>
          {children}
        </TimerProvider>
        <Toaster />
      </body>
    </html>
  );
}
