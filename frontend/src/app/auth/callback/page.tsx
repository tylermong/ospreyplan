"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
    } else if (accessToken) {
      localStorage.setItem("access_token", accessToken);    // localStorage for testing, TODO: Update to use a more secure storage method
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  if (error) {
    return <div>Authentication failed: {error}</div>;
  }

  return <div>Logging you in...</div>;
}
