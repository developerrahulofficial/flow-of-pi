import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { supabase } from "@/lib/supabase";

async function fetchUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const instagramHandle = localStorage.getItem("pending_instagram_handle");
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${session.access_token}`
  };

  if (instagramHandle) {
    headers['x-instagram-handle'] = instagramHandle;
  }

  const response = await fetch("/api/auth/user", {
    headers
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const user = await response.json();

  // Clear the pending handle once we see it's been saved to the user
  if (user && user.instagramHandle && instagramHandle === user.instagramHandle) {
    localStorage.removeItem("pending_instagram_handle");
  }

  return user;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: async (instagramHandle?: string) => {
      if (instagramHandle) {
        localStorage.setItem("pending_instagram_handle", instagramHandle);
      }

      // For simplicity in this demo, we use Supabase Google OAuth
      // You can also implement email/password login here
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
      localStorage.removeItem("pending_instagram_handle");
      // Also notify server to clear session if any
      await fetch("/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      window.location.href = "/";
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
