import { useState, useCallback } from "react";

export interface User {
  email: string;
  name: string;
}

export interface Signup {
  category: string;
  item: string;
  slot: number;
  userEmail: string;
  userName: string;
  notes: string;
  timestamp: string;
}

// Backend base: in dev, Vite proxies `/api/*` to http://localhost:3001 (see vite.config.ts).
const API_BASE = "";

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const apiFetch = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Invalid response from server");
    }

    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return data as T;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<{ success: true; user: User }>("/api/register", {
        method: "POST",
        body: JSON.stringify({
          email: email.toLowerCase(),
          password_hash: simpleHash(password),
          name,
        }),
      });
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<{ success: true; user: User }>("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.toLowerCase(),
          password_hash: simpleHash(password),
        }),
      });
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const getSignups = useCallback(async (): Promise<Signup[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<{ success: true; signups: Signup[] }>("/api/signups");
      return result.signups;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch signups";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const addSignup = useCallback(async (
    category: string,
    item: string,
    slot: number,
    userEmail: string,
    userName: string,
    notes?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch<{ success: true }>("/api/signups", {
        method: "POST",
        body: JSON.stringify({
          category,
          item,
          slot,
          user_email: userEmail,
          user_name: userName,
          notes: notes || "",
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add signup";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const removeSignup = useCallback(async (
    category: string,
    item: string,
    slot: number,
    userEmail: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch<{ success: true }>("/api/signups", {
        method: "DELETE",
        body: JSON.stringify({
          category,
          item,
          slot,
          user_email: userEmail,
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove signup";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  return {
    loading,
    error,
    register,
    login,
    getSignups,
    addSignup,
    removeSignup,
  };
}
