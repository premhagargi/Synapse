import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] font-body text-black">
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-black"></div>
          <div className="h-2 w-2 rounded-full bg-black"></div>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/about" className="text-sm font-light hover:underline">
            ABOUT
          </Link>
          <Link href="/how-it-works" className="text-sm font-light hover:underline">
            HOW IT WORKS
          </Link>
          <Link href="/contact" className="text-sm font-light hover:underline">
            CONTACT US
          </Link>
        </div>
      </header>

      <main className="relative px-6 py-24">
        <div
            className="absolute -left-20 -top-20 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-pink-400/70 via-orange-300/70 to-yellow-200/70 opacity-70 blur-3xl"
            aria-hidden="true"
        />
        <div
            className="absolute -right-20 bottom-0 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-tr from-cyan-300/70 to-blue-400/70 opacity-50 blur-3xl"
            aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-light leading-tight tracking-tight md:text-7xl">
                Get Involved
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600">
                Whether you're a developer looking for affordable AI or have spare compute power to share, we want to hear from you. Join the movement to democratize AI.
            </p>
        </div>

        <section id="cta" className="relative mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* CTA for AI Users */}
          <div className="cta-section flex flex-col justify-between rounded-2xl border border-gray-200 bg-white/50 p-8 text-center shadow-lg lg:p-12">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">Access Affordable AI</h3>
              <p className="mt-4 text-gray-500">
                Get early access to low-cost, privacy-preserving AI inference. Perfect for startups, developers, and small businesses.
              </p>
            </div>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input type="email" placeholder="Enter your email" className="h-12 flex-grow rounded-md border-gray-300 bg-white px-4 text-black placeholder-gray-400" />
              <Button type="submit" size="lg" className="h-12 bg-black text-white hover:bg-gray-800">
                Request Access <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* CTA for Compute Providers */}
          <div className="cta-section flex flex-col justify-between rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50/50 to-orange-50/50 p-8 text-center shadow-lg lg:p-12">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">Contribute & Earn</h3>
              <p className="mt-4 text-gray-500">
                Have an idle GPU or laptop? Join our network, contribute your compute power, and start earning rewards today.
              </p>
            </div>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input type="email" placeholder="Enter your email" className="h-12 flex-grow rounded-md border-gray-300 bg-white px-4 text-black placeholder-gray-400" />
              <Button type="submit" size="lg" className="h-12 bg-black text-white hover:bg-gray-800">
                Join the Network <Cpu className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
