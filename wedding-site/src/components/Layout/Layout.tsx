import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-pastel-cream">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};
