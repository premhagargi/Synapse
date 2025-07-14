import { MountainIcon } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link href="#" className="flex items-center justify-center" prefetch={false}>
        <MountainIcon className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-bold font-headline">Synapse AI</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          Features
        </Link>
        <Link href="#cta" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          Join
        </Link>
        <Link href="#research" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          Research
        </Link>
      </nav>
    </header>
  );
}
