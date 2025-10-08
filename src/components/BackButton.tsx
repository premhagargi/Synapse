'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export function BackButton({ href, children, className = "" }: BackButtonProps) {
  return (
    <Button variant="ghost" asChild className={`mb-4 ${className}`}>
      <Link href={href} className="flex items-center space-x-2">
        <ArrowLeft className="h-4 w-4" />
        <span>{children || 'Back'}</span>
      </Link>
    </Button>
  );
}
