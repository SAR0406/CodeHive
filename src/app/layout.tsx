import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'CodeHive',
  description: 'Build, learn, and collaborate with AI.',
};

const Stars = () => {
  const stars = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2.4}s`,
  }));

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={
            {
              '--star-top': star.top,
              '--star-left': star.left,
              '--star-delay': star.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <Script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.64/build/spline-viewer.js" />
      </head>
      <body className="font-body antialiased dark bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
