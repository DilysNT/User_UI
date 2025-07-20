import type { Metadata } from 'next';
import './globals.css';
import { Montserrat } from 'next/font/google';
import { Toaster } from "../components/ui/toaster";

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Travel Tour',
  description: 'Được tạo bởi nhóm winx',
  generator: 'traveltour.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={montserrat.className}>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}