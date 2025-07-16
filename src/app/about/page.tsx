import Link from "next/link";
import { CheckCircle, ShieldCheck, Users, Zap } from 'lucide-react';

const values = [
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: "Democratized AI Access",
    description: "We lower the barrier for startups and individuals to access high-quality AI without expensive infrastructure, competing with enterprise-focused platforms like Scale AI.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "GDPR-Compliant Privacy",
    description: "Our P2P architecture ensures user data is processed locally on volunteer nodes via IPFS, meaning you never have to share sensitive information. This is privacy by design.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Community-Powered",
    description: "The network is powered by underutilized global compute resources. By contributing, you help build a more equitable and sustainable AI ecosystem.",
  },
    {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Optimized for Speed",
    description: "Through geographic routing, caching, and quantized models, we achieve low latency (~200ms) suitable for most chatbot and text-generation tasks, without the enterprise cost.",
  },
];

const faqs = [
    {
        question: "Is this platform really free?",
        answer: "Yes, we have a generous free tier that allows for 100 queries per month. For unlimited queries, we offer a premium plan for just $5/month, which is a fraction of the cost of traditional cloud providers."
    },
    {
        question: "How do you ensure data privacy?",
        answer: "We use a decentralized model where tasks are sent to nodes via IPFS. Your data is processed on a contributor's device and is never stored on a central server, ensuring GDPR compliance and data sovereignty."
    },
    {
        question: "What are points and how do I earn them?",
        answer: "Contributors earn points for processing inference tasks. These points are tracked in our system and will be redeemable for premium services or, in the future, converted to tokens on the Solana blockchain."
    },
    {
        question: "What hardware do I need to contribute?",
        answer: "You can contribute with most modern consumer GPUs or even just your laptop's CPU. Our platform is designed to leverage any available compute power, no matter how small."
    }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] font-body text-black">
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-black"></div>
            <div className="h-2 w-2 rounded-full bg-black"></div>
            <span className="font-headline font-bold">Synapse AI</span>
        </Link>
        <div className="hidden items-center space-x-6 md:flex">
          <Link href="/about" className="text-sm font-light hover:underline">
            ABOUT
          </Link>
          <Link href="/how-it-works" className="text-sm font-light hover:underline">
            HOW IT WORKS
          </Link>
          <Link href="/dashboard" className="text-sm font-light hover:underline">
            DASHBOARD
          </Link>
          <Link href="/contact" className="text-sm font-light hover:underline">
            CONTACT
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
            Making AI Accessible, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Private & Fair.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600">
            Synapse AI was founded on a simple principle: the power of artificial intelligence should not be monopolized by a few large corporations. We are building a new paradigm for AI services—one that is community-driven, privacy-preserving, and radically affordable.
          </p>
        </div>

        <div className="relative mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {values.map((value) => (
            <div key={value.title} className="rounded-2xl border border-gray-200 bg-white/50 p-8 shadow-sm">
              <div className="flex items-center gap-4">
                {value.icon}
                <h3 className="text-xl font-bold text-gray-800">{value.title}</h3>
              </div>
              <p className="mt-4 text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
        
        {/* FAQ Section */}
        <section id="faq" className="mt-32 scroll-mt-24">
            <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-4xl font-light tracking-tight md:text-5xl">Frequently Asked Questions</h2>
            </div>
            <div className="mx-auto mt-12 max-w-3xl space-y-6">
                {faqs.map((faq) => (
                     <div key={faq.question} className="rounded-2xl border border-gray-200 bg-white/50 p-6 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-800">{faq.question}</h4>
                        <p className="mt-2 text-gray-600">{faq.answer}</p>
                     </div>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
}
