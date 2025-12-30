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

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getScriptUrl = useCallback(() => {
    return localStorage.getItem(SCRIPT_URL_KEY);
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
    const response = await fetch(`${scriptUrl}?${queryString}`, {
      method: 'GET',
      redirect: 'follow',
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Invalid response from server');
    }
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
