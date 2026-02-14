"use client";

import { create } from "zustand";
import { apiClient, ApiClientError } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{ data: { user: User; token: string } }>(
        "/api/auth/login",
        { email, password }
      );
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Login failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{ data: { user: User; token: string } }>(
        "/api/auth/register",
        data
      );
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Registration failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    // Navigate to GET endpoint that clears cookie and redirects to "/".
    // Instant — no fetch, no await, page unloads immediately.
    window.location.href = "/api/auth/logout";
  },

  fetchUser: async () => {
    try {
      const res = await apiClient.get<{ data: { user: User } }>("/api/auth/me");
      set({ user: res.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearError: () => set({ error: null }),
}));
