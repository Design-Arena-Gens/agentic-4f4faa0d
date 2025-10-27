"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export default function SignInPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setErrorMessage("Please provide your email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/app");
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setErrorMessage("Enter your email to receive a magic link.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("Magic link sent! Check your inbox.");
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to keep up with the latest pawsitive updates."
      footer={
        <div className="space-y-2">
          <p>
            New to Petgram?{" "}
            <Link href="/sign-up" className="font-semibold text-moss-500 hover:text-accent-500">
              Create an account
            </Link>
          </p>
          <p>
            Forgot your password?{" "}
            <Link
              href="/forgot-password"
              className="font-semibold text-moss-500 hover:text-accent-500"
            >
              Reset it here
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthInput
          name="email"
          type="email"
          label="Email address"
          required
          placeholder="zoe@petgram.com"
          autoComplete="email"
        />
        <AuthInput
          name="password"
          type="password"
          label="Password"
          required
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        {errorMessage && (
          <p role="status" className="text-sm font-medium text-red-500">
            {errorMessage}
          </p>
        )}
        <AuthSubmitButton isLoading={isLoading}>Log in</AuthSubmitButton>
      </form>
      <form className="space-y-3 border-t border-cream-200 pt-6" onSubmit={handleMagicLink}>
        <p className="text-sm font-medium text-ink-700">Prefer a magic link?</p>
        <AuthInput
          name="email"
          type="email"
          label="Email address"
          placeholder="zoe@petgram.com"
          assistiveText="We will send a one-time sign-in link."
        />
        <AuthSubmitButton isLoading={isLoading} className="bg-forest-900 hover:bg-moss-500">
          Email me a link
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
