"use client"

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
   const router = useRouter();
 const handleSignout = async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          // Force a full server re-render so the dashboard layout
          // (and its theme class) is fully unmounted before the
          // public page paints. Prevents the post-logout color flash.
          router.refresh();
          toast.success("Signed out successfully");
      },
      onError: () => {        
        toast.error("Failed to sign out");
      }
    },
    });
  }
  return handleSignout;
 }
