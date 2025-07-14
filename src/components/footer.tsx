import Link from "next/link";
import { Github, MountainIcon, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card py-6 w-full shrink-0 items-center px-4 md:px-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <MountainIcon className="h-6 w-6 text-primary" />
          <span className="font-semibold font-headline">Synapse AI</span>
        </Link>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Synapse AI. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground" prefetch={false}><Twitter className="h-5 w-5" /></Link>
          <Link href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground" prefetch={false}><Github className="h-5 w-5" /></Link>
        </div>
      </div>
    </footer>
  );
}
