import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api, type User } from "./api";
import { clearToken, getToken, setToken } from "./storage";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let memoryUser: User | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(memoryUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await getToken();
      if (!token) {
        if (active) setReady(true);
        return;
      }
      try {
        const { user: me } = await api.me();
        memoryUser = me;
        if (active) setUser(me);
      } catch {
        memoryUser = null;
        await clearToken();
        if (active) setUser(null);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (token: string, next: User) => {
    await setToken(token);
    memoryUser = next;
    setUser(next);
  }, []);

  const signOut = useCallback(async () => {
    memoryUser = null;
    setUser(null);
    await clearToken();
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
