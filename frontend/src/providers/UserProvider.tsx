"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type User = {
  name: string;
  email: string;
  avatar: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({ user: null, loading: true });

let globalUserCache: User | null = null;

export function UserProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(() => {
    if (initialUser) {
        globalUserCache = initialUser;
        return initialUser;
    }
    return globalUserCache;
  });
  const [loading, setLoading] = useState(() => {
    if (initialUser) return false;
    return !globalUserCache;
  });

  useEffect(() => {
    if (user || globalUserCache) {
      setLoading(false);
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
    fetch(`${apiBase}/auth/me`, { method: "GET", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("not authenticated");
        return res.json();
      })
      .then((u) => {
        const userData = {
          name: u.user_metadata.full_name,
          email: u.user_metadata.email,
          avatar: u.user_metadata.avatar_url,
        };
        globalUserCache = userData;
        setUser(userData);
      })
      .catch((error) => {
        console.error("Failed to fetch user data", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]); // user dependency to skip if already set

  return (
    <UserContext.Provider value={{ user, loading }}>
        {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
