import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHARTIQ | AI-Powered Indian Stock Market Intelligence',
  description: 'AI-Powered Indian Stock Market Chart Intelligence & Trading Analysis Platform. Analyze, Verify, Confirm, Evaluate, Recommend.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070a0f] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}

