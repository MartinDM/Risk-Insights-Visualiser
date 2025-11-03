import { Providers } from '@/components/providers';
import { ModeToggle } from '@/components/mode-toggle';
import '@workspace/ui/styles/globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { Earth } from 'lucide-react';
import Link from 'next/link';

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
          <div className="flex flex-col items-center justify-start gap-2 p-2 mt-2 w-full">
            <div className="w-full max-w-screen-lg px-4">
              <div className="items-center py-4 relative justify-center text-center">
                <h1 className="text-2xl font-bold tracking-tight bg-clip-text bg-gradient-to-r from-zinc-300 to-amber-500 text-transparent cursor-default hover:to-zinc-300">
                  <Link href="/">Person Insight Visualiser</Link>
                  <Earth className="ml-4 inline text-amber-500" />
                </h1>
                <div className="absolute right-0 top-4">
                  <ModeToggle />
                </div>
              </div>
              <div>{children}</div>
            </div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
