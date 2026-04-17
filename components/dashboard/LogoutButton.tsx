"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl
        bg-red-500 text-white font-semibold text-sm
        hover:bg-red-600 active:scale-[0.97]
        transition-all duration-200 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out…" : "Sign Out"}
    </button>
  );
}
