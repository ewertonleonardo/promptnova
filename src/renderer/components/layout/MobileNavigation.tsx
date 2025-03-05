import React, { createContext, Fragment, useContext, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';

interface MobileNavigationProps {
  className?: string;
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 10 9"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M.5 1h9M.5 8h9M.5 4.5h9" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 10 9"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m1.5 1 7 7M8.5 1l-7 7" />
    </svg>
  );
}

const IsInsideMobileNavigationContext = createContext(false);

export function useIsInsideMobileNavigation() {
  return useContext(IsInsideMobileNavigationContext);
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const ToggleIcon = isOpen ? XIcon : MenuIcon;

  return (
    <IsInsideMobileNavigationContext.Provider value={true}>
      <button
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle navigation"
        onClick={toggle}
      >
        <ToggleIcon className="w-2.5 stroke-gray-900 dark:stroke-white" />
      </button>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog onClose={close} className="fixed inset-0 z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 top-14 bg-gray-400/20 backdrop-blur-sm dark:bg-black/40" />
          </Transition.Child>

          <Dialog.Panel>
            <Transition.Child
              as={Fragment}
              enter="duration-500 ease-in-out"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="duration-500 ease-in-out"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="fixed left-0 top-14 bottom-0 w-full overflow-y-auto bg-white px-4 pt-6 pb-4 shadow-lg shadow-gray-900/10 ring-1 ring-gray-900/7.5 dark:bg-gray-900 dark:ring-gray-800 min-[416px]:max-w-sm sm:px-6 sm:pb-10">
                <nav className="space-y-1">
                  <a
                    href="/"
                    className="block py-2 px-3 text-sm transition rounded-md bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  >
                    Home
                  </a>
                  <a
                    href="/docs"
                    className="block py-2 px-3 text-sm transition rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Documentation
                  </a>
                  <a
                    href="/settings"
                    className="block py-2 px-3 text-sm transition rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Settings
                  </a>
                </nav>
              </div>
            </Transition.Child>
          </Dialog.Panel>
        </Dialog>
      </Transition.Root>
    </IsInsideMobileNavigationContext.Provider>
  );
}