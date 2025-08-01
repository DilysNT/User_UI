import type { Metadata } from 'next';
import './globals.css';
import { Montserrat } from 'next/font/google';
import { Toaster } from "../components/ui/toaster";
import ImprovedErrorBoundary from "@/components/ImprovedErrorBoundary";
import ErrorToastContainer from "@/components/ErrorToastContainer";

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Travel Tour',
  description: 'Được tạo bởi nhóm winx',
  generator: 'traveltour.dev',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={montserrat.className}>
      <body suppressHydrationWarning>
        <ImprovedErrorBoundary>
          {children}
          <Toaster />
          <ErrorToastContainer />
        </ImprovedErrorBoundary>
      </body>
    </html>
  );
}