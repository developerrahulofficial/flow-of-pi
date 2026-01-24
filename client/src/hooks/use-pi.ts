import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

// GET /api/pi/state
export function usePiState() {
  return useQuery({
    queryKey: [api.pi.state.path],
    queryFn: async () => {
      const res = await fetch(api.pi.state.path);
      if (!res.ok) throw new Error("Failed to fetch global state");
      return api.pi.state.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Live updates
  });
}

// GET /api/pi/my-digit
export function useMyDigit() {
  return useQuery({
    queryKey: [api.pi.myDigit.path],
    queryFn: async () => {
      const res = await fetch(api.pi.myDigit.path, { credentials: "include" });
      if (res.status === 401) return null; // Not logged in
      if (!res.ok) throw new Error("Failed to fetch my digit");
      return api.pi.myDigit.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

// POST /api/pi/assign-digit
export function useAssignDigit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.pi.assignDigit.path, {
        method: api.pi.assignDigit.method,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to assign digit");
      }
      return api.pi.assignDigit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pi.myDigit.path] });
      queryClient.invalidateQueries({ queryKey: [api.pi.state.path] });
    },
  });
}

// GET /api/pi/wallpaper
export function useWallpaper() {
  return useQuery({
    queryKey: [api.pi.wallpaper.path],
    queryFn: async () => {
      const res = await fetch(api.pi.wallpaper.path);
      if (!res.ok) throw new Error("Failed to fetch wallpaper URLs");
      return api.pi.wallpaper.responses[200].parse(await res.json());
    },
  });
}
