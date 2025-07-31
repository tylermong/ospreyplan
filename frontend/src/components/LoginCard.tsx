import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const supabaseOAuthUrl = `https://${
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID
}.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
  process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/callback"
)}`;

export default function LoginCard() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome to OspreyPlan</CardTitle>
        <CardDescription>
          Login with your Stockton University Google account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" asChild>
          <Link href={supabaseOAuthUrl}>Login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
