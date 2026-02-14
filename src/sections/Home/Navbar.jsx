import { useAuthUser } from "@/customhooks/useAuthUser";
import React from "react";
import { supabase } from "@/config/browser-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

function Navbar() {
  return (
    <nav className="bg-white px-4 py-2 shadow">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-2.5">
        <h2>Assignment</h2>
        <Profile />
      </div>
    </nav>
  );
}

const Profile = () => {
  const { user, loading, error } = useAuthUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || error) {
    return (
      <div className="h-10 rounded-xl max-w-52 w-full bg-black/20 animate-pulse" />
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-2 items-center rounded-full bg-gray-100 p-1 pr-5">
        <div>
          <Image
            src={user?.user_metadata?.avatar_url}
            alt={user?.user_metadata?.name}
            height={30}
            width={30}
            className="shrink-0 rounded-full"
          />
        </div>
        <h2 className="font-medium text-sm">
          {user?.user_metadata?.full_name}
        </h2>
      </div>
      <button
        onClick={handleSignOut}
        className="py-2 text-xs px-4 bg-gray-100 rounded-sm"
      >
        Sign out
      </button>
    </div>
  );
};

export default Navbar;
