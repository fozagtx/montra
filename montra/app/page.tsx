import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { RotatingHeroText } from "@/components/heroText";

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f9fafb] text-gray-900">
      {/* Background Noise Texture */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 mx-auto w-full max-w-6xl px-6 py-8 md:px-8">
        <nav className="relative flex items-center justify-between text-sm font-medium rounded-full bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 text-2xl text-gray-900"
          >
            <Image
              src="/logo.jpeg"
              alt="Monetize logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <h1 className="flex items-center justify-center rounded-full bg-white px-3 py-1 text-base font-semibold tracking-tight shadow-sm">
              Monetize
            </h1>
          </Link>

          <div className="flex items-center gap-5">
            {user ? (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-black text-white hover:bg-gray-800 shadow-md px-5 py-2"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="rounded-full border border-gray-300 bg-white/70 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 shadow-sm"
                >
                  Login
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-black text-white hover:bg-gray-800 shadow-md px-5 py-2"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-32 pt-10 text-center md:px-8">
        <div className="mb-4 relative z-10 animate-pulse text-gray-500">
          Upcoming: Monetize Discord communities
        </div>

        <RotatingHeroText />

        <p className="mt-6 max-w-2xl text-pretty text-lg text-gray-600 sm:text-xl relative z-10">
          Add a product to start selling!
        </p>

        {/* Video Card */}
        <div className="mt-20 flex flex-col items-center gap-6 w-full relative z-10">
          <div className="relative w-full max-w-5xl mx-auto rounded-[1.75rem] bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200 backdrop-blur-md pt-7 pb-4 px-4 z-10">
            <div className="absolute top-3 left-6 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100 mt-3">
              <iframe
                className="w-full aspect-video rounded-xl"
                src="https://www.youtube.com/embed/_eGTi6vJK_0?si=ipzjuPtfBhthn1hL"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-8 md:px-8 flex items-center justify-between text-sm text-gray-500">
        <p className="animate-pulse">powered by Base</p>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-gray-900">
            X
          </Link>
          <Link href="#" className="hover:text-gray-900">
            GitHub
          </Link>
        </div>
      </footer>
    </div>
  );
}
