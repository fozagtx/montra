"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push("/dashboard");
    };
    checkSession();
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center  text-gray-900">
        <Card className="bg-transparent shadow-none p-8 w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Login now
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button
              asChild
              className="w-full rounded-full bg-black text-white hover:bg-gray-800"
            >
              <Link href="/auth/signin">Go to Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-gray-900">
      <Card className="bg-transparent shadow-none p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <Star className="h-6 w-6" />
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Join Monetize
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Earn from your skills today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4 text-left">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-3">
            <Button
              type="submit"
              className="w-full rounded-full bg-black text-white hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-black hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
