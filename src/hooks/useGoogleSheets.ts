import { useState, useCallback } from 'react';

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

const SCRIPT_URL_KEY = 'potluck_script_url';

// Default Google Apps Script Web App URL (can be overridden by setting localStorage `potluck_script_url`,
// or via Vite env var `VITE_GOOGLE_APPS_SCRIPT_URL`).
const DEFAULT_SCRIPT_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_GOOGLE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxErMSS_4DluXlMN8qqH-7wgS56KAnLtBMbfgRHxste2O1XGIhfD-r2UqYnws5UFyMe/exec';

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getScriptUrl = useCallback(() => {
    const overridden = localStorage.getItem(SCRIPT_URL_KEY);
    return (overridden && overridden.trim()) ? overridden.trim() : DEFAULT_SCRIPT_URL;
  }, []);

  const setScriptUrl = useCallback((url: string) => {
    localStorage.setItem(SCRIPT_URL_KEY, url);
  }, []);

  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const callApi = useCallback(async (params: Record<string, string>) => {
    const scriptUrl = getScriptUrl();
    if (!scriptUrl) {
      throw new Error('Please configure your Google Apps Script URL first');
    }

    const queryString = new URLSearchParams(params).toString();
    // Google Apps Script often blocks browser `fetch()` due to Origin/CORS restrictions.
    // Use JSONP (script tag injection) instead. Requires `GOOGLE_APPS_SCRIPT.js` to support `callback=...`.
    const callbackName = `__potluck_jsonp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const src = `${scriptUrl}?${queryString}&callback=${encodeURIComponent(callbackName)}`;

    return await new Promise((resolve, reject) => {
      const w = window as unknown as Record<string, unknown>;
      let scriptEl: HTMLScriptElement | null = null;

      const cleanup = () => {
        if (scriptEl?.parentNode) scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
        delete w[callbackName];
      };

      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error('Request timed out'));
      }, 15000);

      w[callbackName] = (data: unknown) => {
        window.clearTimeout(timeoutId);
        cleanup();
        resolve(data);
      };

      scriptEl = document.createElement('script');
      scriptEl.async = true;
      scriptEl.src = src;
      scriptEl.onerror = () => {
        window.clearTimeout(timeoutId);
        cleanup();
        reject(new Error('Failed to load Google Apps Script'));
      };

      document.head.appendChild(scriptEl);
    });
  }, [getScriptUrl]);

  const register = useCallback(async (email: string, password: string, name: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const result = await callApi({
        action: 'register',
        email: email.toLowerCase(),
        password_hash: simpleHash(password),
        name,
      });
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const result = await callApi({
        action: 'login',
        email: email.toLowerCase(),
        password_hash: simpleHash(password),
      });
      if (!result.success) {
        throw new Error(result.error || 'Invalid email or password');
      }
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  const getSignups = useCallback(async (): Promise<Signup[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await callApi({ action: 'getSignups' });
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch signups');
      }
      return result.signups;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch signups';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

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
      const result = await callApi({
        action: 'addSignup',
        category,
        item,
        slot: slot.toString(),
        user_email: userEmail,
        user_name: userName,
        notes: notes || '',
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to add signup');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add signup';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  const removeSignup = useCallback(async (
    category: string,
    item: string,
    slot: number,
    userEmail: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await callApi({
        action: 'removeSignup',
        category,
        item,
        slot: slot.toString(),
        user_email: userEmail,
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove signup');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove signup';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  return {
    loading,
    error,
    getScriptUrl,
    setScriptUrl,
    register,
    login,
    getSignups,
    addSignup,
    removeSignup,
  };
}
