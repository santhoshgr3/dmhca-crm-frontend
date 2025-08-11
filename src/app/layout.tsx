import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from '@/components/Layout';
import ConnectionMonitor from '@/components/ConnectionMonitor';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DMHCA CRM - Delhi Medical Healthcare Academy",
  description: "Comprehensive CRM system for managing leads, communications, and analytics for Delhi Medical Healthcare Academy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ConnectionMonitor />
              <Layout>
                {children}
              </Layout>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
