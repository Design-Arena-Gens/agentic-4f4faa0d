"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { useSupabase } from "@/components/providers/SupabaseProvider";

const randomAvatar = () => `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${uuid()}`;

export default function SignUpPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const username = String(formData.get("username") ?? "").trim();
    const fullName = String(formData.get("fullName") ?? "").trim();

    if (!email || !password || !username) {
      setErrorMessage("Email, username, and password are required.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          username,
          full_name: fullName,
          avatar_url: randomAvatar(),
        });

      if (profileError) {
        setErrorMessage(profileError.message);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);

    if (data.session) {
      router.replace("/app");
      return;
    }

    setInfoMessage("Please confirm your email address. We just sent you a verification link.");
  }

  return (
    <AuthCard
      title="Create your Petgram account"
      subtitle="Celebrate animals with a playful yet professional presence."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-moss-500 hover:text-accent-500">
            Log in
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
          placeholder="luna@petgram.com"
          autoComplete="email"
        />
        <AuthInput
          name="username"
          label="Profile handle"
          required
          placeholder="luna-the-tabby"
          assistiveText="Handles can include letters, numbers, and hyphens."
        />
        <AuthInput
          name="fullName"
          label="Display name"
          placeholder="Luna the Tabby"
        />
        <AuthInput
          name="password"
          type="password"
          label="Password"
          required
          placeholder="Create a secure password"
          autoComplete="new-password"
        />
        {errorMessage && (
          <p role="status" className="text-sm font-medium text-red-500">
            {errorMessage}
          </p>
        )}
        {infoMessage && (
          <p role="status" className="text-sm font-medium text-moss-500">
            {infoMessage}
          </p>
        )}
        <AuthSubmitButton isLoading={isLoading}>Create account</AuthSubmitButton>
      </form>
      <p className="text-xs text-ink-500">
        By creating an account you agree to our playful yet professional community guidelines focused
        on animal safety and wellbeing.
      </p>
    </AuthCard>
  );
}
