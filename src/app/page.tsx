import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] font-body text-black">
      <Header />

      <main className="relative px-6 pt-12 pb-24">
        {/* Gradient blob */}
        <div
          className="absolute right-0 top-0 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-pink-400/70 via-orange-300/70 to-yellow-200/70 opacity-70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <h1 className="max-w-4xl text-6xl font-light leading-tight tracking-tight md:text-7xl">
            AUTOMATED
            <br />
            FINANCE & COMPLIANCE
            <br />
            FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">MODERN TEAMS.</span>
          </h1>

          <div className="mt-24 flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
            <div className="max-w-md">
              <Button variant="outline" className="rounded-full border-2 border-black px-8 py-6 text-black hover:bg-black hover:text-white">
                <span className="relative">
                  GET A DEMO
                  <div className="absolute -left-4 -right-4 -top-4 -bottom-4 animate-spin-slow rounded-full border border-black opacity-50 group-hover:border-white"></div>
                </span>
              </Button>
              <p className="mt-8 text-sm leading-relaxed text-gray-600">
                STOP CHASING PAPERWORK. START MAKING DECISIONS.
                <br />
                AI-POWERED ANALYSIS FOR CONTRACTS, REPORTS, AND FILINGS.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm">LEARN MORE</span>
              <span className="h-px w-12 bg-black"></span>
            </div>
          </div>
        </div>

        <section id="features" className="mt-32 max-w-4xl">
            <h2 className="text-4xl font-light tracking-tight text-gray-800">Finally, an AI that understands compliance.</h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-700">
                Synapse AI reads and understands your financial documents, saving you hundreds of hours of manual review. It extracts key data, flags compliance risks, and lets you ask questions in plain English.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Instant Extraction</h3>
                    <p className="mt-2 text-gray-600">Automatically pull party names, investment amounts, dates, and critical clauses from any document.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Risk-Aware Analysis</h3>
                    <p className="mt-2 text-gray-600">Our AI flags non-standard terms, missing signatures, and potential compliance issues before they become problems.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Natural Language Q&A</h3>
                    <p className="mt-2 text-gray-600">Ask questions like "What's the deadline for the Series A filing?" and get instant, accurate answers.</p>
                </div>
            </div>
        </section>

        <section id="how-it-works" className="mt-24">
            <h2 className="text-center text-3xl font-light tracking-tight text-gray-800 md:text-4xl">How It Works</h2>
            <div className="mx-auto mt-12 max-w-4xl space-y-8">
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">1. Secure Upload</h3>
                    <p className="mt-2 text-gray-600">Drag and drop your PDFs, Word documents, or even scanned files. Our platform uses OCR to digitize text automatically.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">2. AI Analysis</h3>
                    <p className="mt-2 text-gray-600">Synapse AI processes the document in seconds, creating a structured summary and flagging key compliance items.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">3. Review & Query</h3>
                    <p className="mt-2 text-gray-600">View the executive summary or dive deep by asking specific questions about the document in our chat interface.</p>
                </div>
            </div>
        </section>

        <section id="pricing" className="mt-24 text-center">
          <h2 className="text-3xl font-light tracking-tight text-gray-800 md:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-600">Choose the plan that's right for you. No hidden fees.</p>
          <div className="mt-12 mx-auto max-w-md border rounded-lg p-8">
              <h3 className="text-2xl font-bold">Pro Tier</h3>
              <p className="text-5xl font-light my-4">$49<span className="text-lg">/mo</span></p>
              <ul className="space-y-2 text-gray-600">
                  <li>Unlimited Document Uploads</li>
                  <li>Full Data Extraction & Summaries</li>
                  <li>Compliance Risk Flagging</li>
                  <li>Natural Language Q&A</li>
                  <li>Priority Support</li>
              </ul>
              <Button variant="outline" className="mt-8 rounded-full border-2 border-black px-12 py-6 text-black hover:bg-black hover:text-white">
                  Get Started
              </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
