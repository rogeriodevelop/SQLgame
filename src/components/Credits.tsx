import type { CSSProperties } from 'react';

/** Créditos de desenvolvimento, no rodapé da abertura e da mesa. */
export function Credits({ style }: { style?: CSSProperties }) {
  return (
    <footer
      style={{
        textAlign: 'center',
        fontFamily: 'var(--font-type)',
        fontSize: 'var(--fs-xs)',
        letterSpacing: '0.06em',
        color: 'var(--on-dark-muted)',
        ...style,
      }}
    >
      Desenvolvido por Professor Rogerio Santos - 2026
    </footer>
  );
}
