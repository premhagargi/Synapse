import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight } from "lucide-react";

const recentTasks = [
    { id: 1, description: "Summarized a news article", points: 5 },
    { id: 2, description: "Generated chatbot response", points: 2 },
    { id: 3, description: "Classified an image", points: 10 },
    { id: 4, description: "Generated chatbot response", points: 2 },
];

export default function DashboardPage() {
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

      <main className="relative px-6 py-24">
        <div
            className="absolute -left-20 -top-20 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-cyan-300/70 to-blue-400/70 opacity-50 blur-3xl"
            aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-light leading-tight tracking-tight md:text-7xl">
                Your Dashboard
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600">
                Track your contributions, view your points, and see the impact you're making on the decentralized AI community.
            </p>
        </div>

        {/* Points Summary */}
        <section className="relative mx-auto mt-20 max-w-2xl">
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-8 text-center shadow-lg">
                <h3 className="text-2xl font-bold text-gray-500">Total Points Earned</h3>
                <div className="my-4 flex items-center justify-center gap-4">
                    <Award className="h-16 w-16 text-primary" />
                    <p className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
                        1,250
                    </p>
                </div>
                <p className="text-gray-600">
                    Points can be redeemed for premium features. Solana token integration is coming soon!
                </p>
            </div>
        </section>

        {/* Recent Activity */}
        <section className="relative mx-auto mt-16 max-w-2xl">
            <h3 className="text-center text-3xl font-light text-gray-800">Recent Activity</h3>
            <div className="mt-8 space-y-4">
                {recentTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm">
                        <p className="text-gray-700">{task.description}</p>
                        <p className="font-bold text-primary">+{task.points} pts</p>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <Button variant="outline" asChild>
                    <Link href="#/">View All Activity <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        </section>

      </main>
    </div>
  );
}
