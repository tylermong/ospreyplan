"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function base64URLEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-") // Convert '+' to '-'
    .replace(/\//g, "_") // Convert '/' to '_'
    .replace(/=+$/, ""); // Remove trailing '=' characters
}

async function generatePKCE() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const code_verifier = base64URLEncode(array.buffer);

  const encoder = new TextEncoder();
  const data = encoder.encode(code_verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const code_challenge = base64URLEncode(digest);

  return { code_verifier, code_challenge };
}

export default function LoginCard() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Check whether the user is already authenticated. If so, redirect to the planner.
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
    void (async () => {
      try {
        const res = await fetch(`${apiBase}/auth/me`, { method: "GET", credentials: "include" });
        if (res.ok) {
          router.replace("/planner");
        }
      } catch (error) {
        console.error("Failed to check authentication status", error);
      }
    })();
  }, [router]);

  const handleLogin = async () => {
    const { code_verifier, code_challenge } = await generatePKCE();
    sessionStorage.setItem("pkce_code_verifier", code_verifier);

    const supabaseOAuthUrl = `https://${
      process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID
    }.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/callback"
    )}&response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&hd=${
      process.env.NEXT_PUBLIC_GOOGLE_DOMAIN
    }`;

    window.location.href = supabaseOAuthUrl;
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
      const res = await fetch(`${apiBase}/auth/demo-login`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.replace("/planner");
      } else {
        console.error("Demo login failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Demo login error", error);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-8 text-center">
      <CardHeader>
        <CardTitle>Welcome to OspreyPlan</CardTitle>
        <CardDescription>
          Login with your Stockton University Google account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Button variant="outline" className="w-full" onClick={handleLogin}>
            Login
          </Button>
          <button 
            onClick={handleDemoLogin}
            disabled={loading}
            className="text-xs text-muted-foreground/50 hover:text-primary transition-colors hover:underline"
          >
            {loading ? "Setting up demo..." : "Not a Stockton student? Explore the Demo version"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
