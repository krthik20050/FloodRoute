import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'FloodRoute | Try a road closure near Aluva',
  description:
    'Choose example places near Aluva and see how closing a road changes access to hospitals and shelters. Demo data only, not live travel advice.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
