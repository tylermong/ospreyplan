"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
      return;
    }
    if (!code) {
      setError("Missing code parameter.");
      return;
    }

    const code_verifier = sessionStorage.getItem("pkce_code_verifier");
    if (!code_verifier) {
      setError("Missing PKCE code_verifier.");
      return;
    }

    // Exchange code + code_verifier for tokens
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code, code_verifier }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Token exchange failed");
        }
        sessionStorage.removeItem("pkce_code_verifier");
        router.replace("/dashboard");
      })
      .catch((err) => setError(err.message));
  }, [searchParams, router]);

  if (error) {
    return <div>Authentication failed: {error}</div>;
  }

  return <div>Logging you in...</div>;
}
