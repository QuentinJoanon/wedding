import type { ReactNode } from 'react';
import { Intro } from './Intro';
import { Nav } from './Nav';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  useScrollReveal();

  return (
    <>
      <Intro />
      <Nav />
      <span id="top"></span>
      <main>{children}</main>
    </>
  );
};
