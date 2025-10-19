import { Providers } from '@/components/providers';
import '@workspace/ui/styles/globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '../components/navbar';
const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex flex-col items-center justify-start min-h-svh gap-2">
            <Navbar />
            <div className="w-full max-w-screen-lg px-4">{children}</div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
