import { Providers } from '@/components/providers';
import '@workspace/ui/styles/globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { Earth } from 'lucide-react';

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
          <div className="flex flex-col items-center justify-start gap-2 p-2 mt-2">
            <h1 className="text-2xl font-bold justify-center items-center tracking-tight p-5 flex bg-clip-text bg-gradient-to-r from-zinc-300  to-amber-500 text-transparent cursor-default hover:to-zinc-300  hover:text-zinc-300">
              Person Insight Visualiser
              <Earth className="ml-4 text-amber-500" />
            </h1>
            <div className="w-full max-w-screen-lg px-4">{children}</div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
