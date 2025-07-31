import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

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
  const handleLogin = async () => {
    const { code_verifier, code_challenge } = await generatePKCE();
    sessionStorage.setItem("pkce_code_verifier", code_verifier);

    const supabaseOAuthUrl = `https://${
      process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID
    }.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/callback"
    )}&response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256`;

    window.location.href = supabaseOAuthUrl;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome to OspreyPlan</CardTitle>
        <CardDescription>
          Login with your Stockton University Google account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" onClick={handleLogin}>
          Login
        </Button>
      </CardContent>
    </Card>
  );
}
