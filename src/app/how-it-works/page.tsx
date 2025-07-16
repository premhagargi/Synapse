import Link from "next/link";
import { Zap, ShieldCheck, Cpu } from 'lucide-react';

const steps = [
  {
    icon: <Cpu className="h-8 w-8 text-pink-500" />,
    title: "Contribute Resources",
    description: "Individuals and organizations contribute idle compute power from devices like GPUs and laptops to the network."
  },
  {
    icon: <Zap className="h-8 w-8 text-orange-500" />,
    title: "Process Tasks",
    description: "The P2P network distributes AI inference tasks (e.g., text generation) across available nodes for processing."
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-yellow-500" />,
    title: "Earn Rewards",
    description: "Contributors earn points for their compute time, creating a fair and incentivized ecosystem."
  }
];

export default function HowItWorksPage() {
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

      <main className="relative px-6 pt-12 pb-24">
        <div
          className="absolute -right-20 top-1/4 h-[500px] w-[500px] -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-pink-400/70 via-orange-300/70 to-yellow-200/70 opacity-50 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-light leading-tight tracking-tight md:text-7xl">
            A New <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Paradigm</span> for AI
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-gray-600">
            Our platform enables affordable, privacy-focused AI by distributing computation across a peer-to-peer network of volunteer nodes. This leverages underutilized community hardware to offer a low-cost alternative to centralized cloud providers.
          </p>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white/80 shadow-sm">
                  {step.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-800">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-24 max-w-4xl rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50/50 to-orange-50/50 p-12 text-center">
           <h2 className="text-3xl font-bold text-gray-800">The Power of Peer-to-Peer</h2>
           <p className="mx-auto mt-4 max-w-2xl text-gray-600">
             We use P2P protocols like IPFS for data and model sharing, combined with a simple, points-based reward system tracked in a lightweight database. This avoids the complexity of blockchain while building a robust foundation for a future token-based economy.
           </p>
        </div>
      </main>
    </div>
  );
}
