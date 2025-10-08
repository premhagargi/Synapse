
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] font-body text-black">
       <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-black"></div>
            <div className="h-2 w-2 rounded-full bg-black"></div>
            <span className="font-headline font-bold">Synapse AI</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/signup" className="text-sm font-light hover:underline">
            SIGN UP
          </Link>
        </div>
      </header>
      <main className="flex items-center justify-center pt-20">
        <div className="w-full max-w-md space-y-8 rounded-lg border p-10">
          <div className="text-center">
            <h1 className="text-4xl font-light tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-gray-600">Log in to access your dashboard.</p>
          </div>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" variant="outline" className="w-full rounded-full border-2 border-black px-8 py-6 text-black hover:bg-black hover:text-white">
              Log In
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-black hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
