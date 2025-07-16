import Link from "next/link";
import { CheckCircle } from 'lucide-react';

const features = [
  {
    icon: <CheckCircle className="h-6 w-6 text-pink-500" />,
    title: "Democratizes AI Access",
    description: "Lowers the barrier for startups and individuals to access high-quality AI without expensive infrastructure.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-orange-500" />,
    title: "Scalability",
    description: "Harnesses underutilized global compute resources, creating a massive, cost-effective compute pool.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-yellow-500" />,
    title: "Privacy and Control",
    description: "Users can train models on local data without sharing it, addressing privacy concerns in sensitive industries.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-cyan-500" />,
    title: "Sustainability",
    description: "Optimizes resource use, reducing the environmental impact of AI training compared to centralized data centers.",
  },
];

export default function AboutPage() {
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
          className="absolute -left-20 top-1/2 h-[500px] w-[500px] -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-pink-400/70 via-orange-300/70 to-yellow-200/70 opacity-50 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-light leading-tight tracking-tight md:text-7xl">
            Why We're a <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Game-Changer</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600">
            The AI race is compute-constrained, with GPU shortages and high costs limiting innovation. We're building a game-changer that addresses this critical gap, leverages unique infrastructure, and scales effectively for everyone.
          </p>
        </div>
        <div className="relative mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-gray-200 bg-white/50 p-8 shadow-sm">
              <div className="flex items-center gap-4">
                {feature.icon}
                <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
              </div>
              <p className="mt-4 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
