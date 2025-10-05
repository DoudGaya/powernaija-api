import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Energy Token Platform',
  description: 'Login or register to access your energy token management account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
