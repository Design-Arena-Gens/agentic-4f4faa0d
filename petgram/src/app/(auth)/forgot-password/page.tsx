"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export default function ForgotPasswordPage() {
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setErrorMessage("Please enter the email associated with your account.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Password reset instructions are on their way to your inbox.");
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We will email you a secure link to update your password."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/sign-in" className="font-semibold text-moss-500 hover:text-accent-500">
            Return to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthInput
          name="email"
          type="email"
          label="Email address"
          required
          placeholder="poppy@petgram.com"
        />
        {errorMessage && (
          <p role="status" className="text-sm font-medium text-red-500">
            {errorMessage}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm font-medium text-moss-500">
            {message}
          </p>
        )}
        <AuthSubmitButton isLoading={isLoading}>Send reset link</AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
