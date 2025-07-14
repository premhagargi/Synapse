import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
      <div aria-hidden="true" className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />
      <div aria-hidden="true" className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="container px-4 md:px-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
            The Future of Decentralized AI
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Synapse AI provides affordable access to powerful AI models and allows you to earn by contributing your compute power.
          </p>
          <div className="space-x-4 pt-4">
            <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
              <Link href="#cta">Get Cheaper Access</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="transition-transform duration-300 hover:scale-105">
              <Link href="#cta">Contribute & Earn</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
