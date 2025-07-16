"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Cpu } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-lg">Synapse AI</span>
        </div>
        <div className="flex items-center space-x-6">
           <Button variant="ghost" asChild>
            <Link href="#features">Features</Link>
           </Button>
            <Button variant="ghost" asChild>
             <Link href="#cta">Get Started</Link>
            </Button>
        </div>
      </header>

      <main className="relative px-6 pt-12">
        {/* Gradient blob */}
        <div
          className="absolute -right-20 -top-20 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 opacity-70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <h1 className="max-w-4xl text-5xl md:text-7xl font-light leading-tight tracking-tight">
            DECENTRALIZED AI
            <br />
            FOR EVERYONE.
          </h1>

          <div className="mt-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="max-w-md">
                <Button variant="outline" className="rounded-full border-2 px-8" asChild>
                    <Link href="#cta">
                        <span className="relative">
                        JOIN THE NETWORK
                        <div className="absolute -left-4 -right-4 -top-4 -bottom-4 animate-spin-slow rounded-full border border-foreground opacity-50"></div>
                        </span>
                    </Link>
              </Button>
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                ACCESS AFFORDABLE, PRIVACY-FOCUSED AI
                <br />
                POWERED BY A GLOBAL P2P NETWORK.
              </p>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <span className="text-sm">HOW IT WORKS</span>
                <span className="h-px w-12 bg-foreground"></span>
              </div>
            </div>
          </div>

          <p id="features" className="mt-24 max-w-xl text-sm leading-relaxed text-muted-foreground scroll-mt-24">
            Synapse AI enables developers, businesses, and individuals to access powerful AI without expensive centralized cloud providers. By distributing computation across a network of volunteer nodes, we offer a low-cost, privacy-focused alternative, powered by underutilized community hardware.
          </p>
        </div>

        <section id="cta" className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-24 scroll-mt-24">
          {/* CTA for AI Users */}
          <div className="cta-section bg-secondary/50 border border-border rounded-2xl p-8 lg:p-12 text-center flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-bold">Access Affordable AI</h3>
              <p className="mt-4 text-muted-foreground">
                Get early access to low-cost, privacy-preserving AI inference. Perfect for startups, developers, and small businesses.
              </p>
            </div>
            <form className="mt-8 flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="Enter your email" className="bg-background border-input text-foreground h-12 flex-grow rounded-md px-4" />
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                Request Access <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* CTA for Compute Providers */}
          <div className="cta-section bg-accent/10 border border-accent/20 rounded-2xl p-8 lg:p-12 text-center flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-bold">Contribute & Earn</h3>
              <p className="mt-4 text-muted-foreground">
                Have an idle GPU or laptop? Join our network, contribute your compute power, and start earning rewards today.
              </p>
            </div>
            <form className="mt-8 flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="Enter your email" className="bg-background border-input text-foreground h-12 flex-grow rounded-md px-4" />
              <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-12">
                Join the Network <Cpu className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
