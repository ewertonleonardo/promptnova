import React from 'react';
import clsx from 'clsx';

interface NavigationProps {
  className?: string;
}

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, children, active }: NavItemProps) {
  return (
    <a
      href={href}
      className={clsx(
        'block py-2 px-3 text-sm transition rounded-md',
        active
          ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
      )}
    >
      {children}
    </a>
  );
}

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={clsx('space-y-1', className)}>
      <NavItem href="/" active>
        Home
      </NavItem>
      <NavItem href="/docs">
        Documentation
      </NavItem>
      <NavItem href="/settings">
        Settings
      </NavItem>
    </nav>
  );
}