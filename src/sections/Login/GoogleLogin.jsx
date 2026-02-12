"use client";

import { getSupabaseBrowserClient, supabase } from "@/config/browser-client";
import { useState, useEffect } from "react";

export default function GoogleLoginDemo({ user }) {
  const [currentUser, setCurrentUser] = useState(user);

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google OAuth error:", error.message);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-[#1662c4]"
      >
        Continue with Google
      </button>
    </>
  );
}
