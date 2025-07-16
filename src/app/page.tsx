import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Cpu, CheckCircle, ShieldCheck } from "lucide-react"
import Image from "next/image"

export default function Page() {
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
        {/* Gradient blob */}
        <div
          className="absolute -right-20 -top-20 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-pink-400/70 via-orange-300/70 to-yellow-200/70 opacity-70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-light leading-tight tracking-tight md:text-7xl">
            AI Chatbots at <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">1/3rd the Cost.</span>
            <br />
            Fully GDPR-Compliant.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600">
            Synapse AI provides affordable, privacy-focused AI services by harnessing a global peer-to-peer network of community-powered hardware.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="#submit-task">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
               <Link href="/how-it-works">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>

        {/* Demo Video Section */}
        <section id="demo" className="mt-32 scroll-mt-24">
            <div className="relative mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white/50 p-4 shadow-2xl">
                <div className="aspect-video w-full rounded-lg bg-gray-200">
                     <Image 
                        src="https://placehold.co/1280x720.png" 
                        alt="Demo video placeholder"
                        width={1280}
                        height={720}
                        className="w-full h-full object-cover rounded-lg"
                        data-ai-hint="abstract animation"
                     />
                </div>
            </div>
        </section>


        {/* Task Submission Section */}
        <section id="submit-task" className="mt-32 scroll-mt-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-light tracking-tight md:text-5xl">Submit an Inference Task</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
              Try our decentralized network now. Enter a prompt and see the real-time results from our community-powered nodes.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-8 shadow-lg">
                <form>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="prompt" className="sr-only">Your Prompt</label>
                        <textarea id="prompt" name="prompt" rows={4} placeholder="e.g., Summarize the following text for me..." className="w-full rounded-md border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 focus:ring-2 focus:ring-primary"></textarea>
                        <Button type="submit" size="lg" className="w-full">
                            Process Task <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </form>
                <div className="mt-6 min-h-[100px] rounded-md border border-dashed border-gray-300 bg-gray-50 p-4">
                    <p className="text-gray-500">Your results will appear here...</p>
                </div>
            </div>
          </div>
        </section>

        {/* Node Sign-up Section */}
        <section id="join-network" className="mt-32 scroll-mt-24">
           <div className="relative mx-auto max-w-5xl rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50/50 to-orange-50/50 p-12 text-center">
             <h2 className="text-4xl font-bold text-gray-800">Contribute & Earn Rewards</h2>
             <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
               Have an idle GPU or extra CPU cycles? Join our network, contribute your compute power, and earn points for every task you process.
             </p>
            <div className="mt-8">
                 <Button size="lg" asChild>
                    <Link href="/contact#contribute">
                        Join the Network <Cpu className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
           </div>
        </section>

      </main>
    </div>
  )
}
