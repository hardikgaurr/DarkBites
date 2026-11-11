import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { href, navigate, type Route } from '../../lib/router';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Route; children: ReactNode; onNavigate?: () => void };

export function Link({ to, children, onClick, onNavigate, ...rest }: Props) {
  return (
    <a
      href={href(to)}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate?.();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
