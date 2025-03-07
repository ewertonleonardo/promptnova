import React, { ReactNode } from 'react';
import { useA11y } from '../../hooks/useA11y';

interface SkipLinkProps {
  href: string;
  children: ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </a>
  );
};

interface A11yAnnouncerProps {
  assertive?: boolean;
}

export const A11yAnnouncer: React.FC<A11yAnnouncerProps> = ({ assertive = false }) => {
  const { announcements } = useA11y();
  const ariaLive = assertive ? 'assertive' : 'polite';
  
  return (
    <div
      aria-live={ariaLive}
      aria-atomic="true"
      className="sr-only"
      data-testid={`a11y-announcer-${ariaLive}`}
    >
      {announcements[ariaLive]}
    </div>
  );
};

interface FocusTrapProps {
  active: boolean;
  children: ReactNode;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ active, children }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);
  
  return <div ref={containerRef}>{children}</div>;
};

export const A11yProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <A11yAnnouncer />
      <A11yAnnouncer assertive />
      {children}
    </>
  );
};