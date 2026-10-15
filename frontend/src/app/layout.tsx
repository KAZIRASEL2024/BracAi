import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'BRAC AISP — Doctor Management System',
    template: '%s | BRAC AISP DMS',
  },
  description:
    'Doctor Management System for BRAC AISP — review animal health consultations and submit clinical feedback.',
  keywords: ['BRAC', 'AISP', 'veterinary', 'doctor', 'consultation', 'animal health'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
