"use client";

import { create } from "zustand";
import { apiClient, ApiClientError } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

type AuthStatus = "authenticated" | "verification_required" | "mfa_required";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaPending: boolean;
  mfaTempToken: string | null;
  verificationRequired: boolean;
  verificationEmail: string | null;
  login: (email: string, password: string) => Promise<AuthStatus>;
  register: (data: { email: string; password: string; name?: string }) => Promise<AuthStatus>;
  verifyMfa: (code: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  clearMfaState: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  mfaPending: false,
  mfaTempToken: null,
  verificationRequired: false,
  verificationEmail: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{
        data: { status: AuthStatus; user: User; tempToken?: string; message?: string };
      }>("/api/auth/login", { email, password });

      const { status, user, tempToken } = res.data;

      if (status === "mfa_required") {
        set({
          mfaPending: true,
          mfaTempToken: tempToken ?? null,
          user,
          isLoading: false,
        });
        return status;
      }

      if (status === "verification_required") {
        set({
          verificationRequired: true,
          verificationEmail: email,
          user,
          isLoading: false,
        });
        return status;
      }

      set({ user, isAuthenticated: true, isLoading: false });
      return status;
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Login failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{
        data: { status: AuthStatus; user: User; message?: string };
      }>("/api/auth/register", data);

      const { status, user } = res.data;

      if (status === "verification_required") {
        set({
          verificationRequired: true,
          verificationEmail: data.email,
          user,
          isLoading: false,
        });
        return status;
      }

      set({ user, isAuthenticated: true, isLoading: false });
      return status;
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Registration failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifyMfa: async (code) => {
    const { mfaTempToken } = get();
    if (!mfaTempToken) throw new Error("No MFA session");

    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{
        data: { status: string; user: User };
      }>("/api/auth/verify-mfa", { code, tempToken: mfaTempToken });

      set({
        user: res.data.user,
        isAuthenticated: true,
        mfaPending: false,
        mfaTempToken: null,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Verification failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{
        data: { status: string; user: User };
      }>("/api/auth/verify-email", { token });

      set({
        user: res.data.user,
        isAuthenticated: true,
        verificationRequired: false,
        verificationEmail: null,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Verification failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  resendVerification: async () => {
    const { verificationEmail } = get();
    if (!verificationEmail) return;

    set({ isLoading: true, error: null });
    try {
      await apiClient.post("/api/auth/resend-verification", { email: verificationEmail });
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to resend";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
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
  clearMfaState: () => set({ mfaPending: false, mfaTempToken: null }),
}));
