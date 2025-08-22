'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@clerk/nextjs';
import { User } from 'lucide-react';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClickOutside);
    return () => window.removeEventListener('click', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="User menu"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <User className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border bg-white dark:bg-neutral-900 shadow-lg p-2">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/profile" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Profile
            </Link>
            <Link href="/settings" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Settings
            </Link>
            <SignOutButton>
              <button className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Sign out
              </button>
            </SignOutButton>
          </SignedIn>
        </div>
      )}
    </div>
  );
}
