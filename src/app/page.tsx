import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] font-body text-black">
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-black"></div>
            <div className="h-2 w-2 rounded-full bg-black"></div>
            <span className="font-headline font-bold">Synapse AI</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/about" className="text-sm font-light hover:underline">
            ABOUT
          </Link>
          <Link href="/how-it-works" className="text-sm font-light hover:underline">
            HOW IT WORKS
          </Link>
          <Link href="/contact" className="text-sm font-light hover:underline">
            CONTACT
          </Link>
        </div>
      </header>

      <main className="relative px-6 pt-12 pb-24">
        {/* Gradient blob */}
        <div
          className="absolute right-0 top-0 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-pink-400/70 via-orange-300/70 to-yellow-200/70 opacity-70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <h1 className="max-w-4xl text-6xl font-light leading-tight tracking-tight md:text-7xl">
            DECENTRALIZED AI
            <br />
            FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">EVERYONE.</span>
          </h1>

          <div className="mt-24 flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
            <div className="max-w-md">
              <Button variant="outline" className="rounded-full border-2 border-black px-8 py-6 text-black hover:bg-black hover:text-white">
                <span className="relative">
                  DISCUSS THE PROJECT
                  <div className="absolute -left-4 -right-4 -top-4 -bottom-4 animate-spin-slow rounded-full border border-black opacity-50 group-hover:border-white"></div>
                </span>
              </Button>
              <p className="mt-8 text-sm leading-relaxed text-gray-600">
                AFFORDABLE, PRIVACY-FOCUSED AI
                <br />
                POWERED BY A P2P NETWORK.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm">LEARN MORE</span>
              <span className="h-px w-12 bg-black"></span>
            </div>
          </div>

          <div className="mt-24 max-w-xl text-lg leading-relaxed text-gray-800">
            <h2 className="text-2xl font-bold">What is Synapse AI?</h2>
            <p className="mt-4">
              A decentralized platform that allows individuals and small businesses to access high-quality AI without expensive infrastructure. We harness underutilized global compute resources, creating a massive, cost-effective, and privacy-preserving compute pool.
            </p>
          </div>
        </div>

        <section className="mt-24">
            <h2 className="text-center text-3xl font-light tracking-tight text-gray-800 md:text-4xl">Our Services</h2>
            <div className="mx-auto mt-12 max-w-4xl space-y-8">
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Affordable AI Inference</h3>
                    <p className="mt-2 text-gray-600">Access powerful models like Llama 3 for tasks like chatbot responses and text summarization at a fraction of the cost of centralized providers.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Privacy-Focused Processing</h3>
                    <p className="mt-2 text-gray-600">With our P2P architecture using IPFS, your data is processed locally on volunteer nodes, ensuring it never has to be shared or stored on central servers.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Community-Powered Network</h3>
                    <p className="mt-2 text-gray-600">Contribute your spare CPU/GPU power to the network and earn points, helping to build a more equitable and sustainable AI ecosystem.</p>
                </div>
            </div>
        </section>
      </main>
    </div>
  )
}
