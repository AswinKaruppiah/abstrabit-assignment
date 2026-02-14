"use client";

import { getSupabaseBrowserClient, supabase } from "@/config/browser-client";
import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function GoogleLoginBox({ user }) {
  const [currentUser, setCurrentUser] = useState(user);

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast.error(err.message || "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full py-6 px-4 max-w-sm mx-auta rounded-2xl shadow bg-white border border-gray-200">
        <h2 className="text-center opacity-90 text-2xl font-semibold">
          Continue with Google
        </h2>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-10 bg-black/10 rounded-md flex w-full items-center justify-center gap-2 px-4 py-3 text-sm text-gray-600 transition"
        >
          <Image src={"/google-logo.png"} alt="logo" height={20} width={20} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
