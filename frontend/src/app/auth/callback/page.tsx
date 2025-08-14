"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Logging you in...</div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
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

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code, code_verifier }),
        });

        if (!res.ok) {
          let msg = "Sign-in failed. Please try again.";
          try {
            const data = await res.json();
            msg = data?.error || msg;
          } catch {}
          throw new Error(msg);
        }

        sessionStorage.removeItem("pkce_code_verifier");
        router.replace("/dashboard");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
      }
    };

    void handleAuthCallback();
  }, [searchParams, router]);

  if (error) {
    return <div>Authentication failed: {error}</div>;
  }

  return <div>Logging you in...</div>;
}
