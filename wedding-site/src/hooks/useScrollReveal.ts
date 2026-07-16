import { useEffect } from 'react';

/**
 * Reveal au scroll : observe tous les éléments `.reveal` et leur ajoute `.in`
 * lorsqu'ils entrent dans le viewport (seuil 0.12, rootMargin -8%).
 * Respecte `prefers-reduced-motion` : tout est rendu visible sans animation.
 * Un MutationObserver reprend les `.reveal` ajoutés après coup (contenu async,
 * ex. la liste de cadeaux chargée depuis le Sheet), qui sinon resteraient à
 * `opacity: 0` faute d'avoir été observés au montage.
 */
export function useScrollReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealNow = (root: ParentNode = document) =>
      Array.from(root.querySelectorAll<HTMLElement>('.reveal:not(.in)'));

    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealNow().forEach((n) => n.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    const observe = (nodes: HTMLElement[]) => nodes.forEach((n) => io.observe(n));

    observe(revealNow());

    // Reprend les `.reveal` insérés dynamiquement après le montage.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('.reveal:not(.in)')) io.observe(node);
          observe(revealNow(node));
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
