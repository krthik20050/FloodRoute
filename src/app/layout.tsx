import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'FloodRoute | Community accessibility lab',
  description:
    'Explore how simulated flood closures affect routes and access to essential facilities in Kerala.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
