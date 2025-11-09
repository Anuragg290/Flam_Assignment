import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Performance Dashboard',
  description: 'High-performance real-time data visualization dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

