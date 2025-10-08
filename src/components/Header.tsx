'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';

export function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <header className="flex items-center justify-between p-6">
      <Link href="/" className="flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-black"></div>
        <div className="h-2 w-2 rounded-full bg-black"></div>
        <span className="font-headline font-bold">Synapse AI</span>
      </Link>
      <div className="flex items-center space-x-6">
        {!loading &&
          (user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-light hover:underline"
              >
                DASHBOARD
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-sm font-light hover:underline"
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
