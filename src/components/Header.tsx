'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={cn("text-sm font-light hover:underline", isActive && "font-semibold")}>
            {children}
        </Link>
    )
}

export function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b">
      <Link href="/" className="flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-black"></div>
        <div className="h-2 w-2 rounded-full bg-black"></div>
        <span className="font-headline font-bold">Synapse AI</span>
      </Link>
      <div className="flex items-center space-x-6">
        <NavLink href="/help">
          HELP
        </NavLink>
        <NavLink href="/support">
          SUPPORT
        </NavLink>
        {!loading &&
          (user ? (
            <>
              <NavLink href="/dashboard">
                DASHBOARD
              </NavLink>
              <NavLink href="/documents">
                DOCUMENTS
              </NavLink>
              <NavLink href="/profile">
                PROFILE
              </NavLink>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-sm font-light hover:underline p-0 h-auto"
              >
                LOG OUT
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-light hover:underline"
              >
                LOGIN
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-black px-4 py-2 text-sm font-light hover:bg-black hover:text-white"
              >
                SIGN UP
              </Link>
            </>
          ))}
      </div>
    </header>
  );
}
