"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export default function ResetPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
    });
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Password updated! You can now sign in with your new password.");

    setTimeout(() => {
      router.replace("/sign-in");
    }, 2500);
  }

  if (hasSession === false) {
    return (
      <AuthCard
        title="Link expired"
        subtitle="The password reset link is invalid or has expired."
      >
        <p className="text-sm text-ink-700">
          Request a new link from the password reset page to securely update your credentials.
        </p>
        <button
          type="button"
          onClick={() => router.replace("/forgot-password")}
          className="focus-ring mt-6 inline-flex w-full items-center justify-center rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-forest-900/20 transition hover:bg-moss-500"
        >
          Request new link
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Secure your account with a fresh password."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthInput
          name="password"
          type="password"
          label="New password"
          required
          placeholder="Enter a strong password"
        />
        <AuthInput
          name="confirmPassword"
          type="password"
          label="Confirm password"
          required
          placeholder="Repeat your new password"
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
        <AuthSubmitButton isLoading={isLoading}>Update password</AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
