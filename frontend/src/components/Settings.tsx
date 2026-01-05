"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { 
    Select, 
    SelectContent, 
    SelectGroup, 
    SelectItem, 
    SelectLabel, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { setTheme, theme } = useTheme();

  // 1. Profile State
  const [profile, setProfile] = useState<{ name: string; email: string; avatar: string } | null>(null);
  
  // 2. Academic State
  const [degree, setDegree] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    async function fetchData() {
      try {
        // Fetch Profile (Reuse your /auth/me endpoint)
        const authRes = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
        if (authRes.ok) {
          const user = await authRes.json();
          if (mounted) {
            setProfile({
              name: user.user_metadata.full_name,
              email: user.user_metadata.email,
              avatar: user.user_metadata.avatar_url,
            });
          }
        }

        // Fetch Settings
        const settingsRes = await fetch(`${apiBase}/api/settings`, { credentials: "include" });
        if (settingsRes.ok) {
          const body = await settingsRes.json();
          if (mounted) {
            setDegree(body.degree ?? null);
          }
        }
      } catch {
        if (mounted) setError("Failed to load account data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, []);

  async function saveSettings(updates: { degree?: string | null; startYear?: number | null }) {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const payload = {
        degree: updates.degree !== undefined ? updates.degree : degree,
    };

    try {
        await fetch(`${apiBase}/api/settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        });
    } catch {
        setError("Failed to save changes.");
    }
  }

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Account & Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile, academic preferences, and app appearance.
        </p>
      </div>

      <Separator />

      {/* SECTION 1: Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Information from your goStockton account.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar} />
            <AvatarFallback>{profile?.name?.substring(0,2).toUpperCase() ?? "OP"}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-medium text-lg">{profile?.name || "Guest User"}</h4>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Academic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Plan</CardTitle>
          <CardDescription>Personalize your degree audit requirements.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Degree Program</label>
                <Select
                    value={degree ?? undefined}
                    onValueChange={(val) => {
                        setDegree(val);
                        void saveSettings({ degree: val });
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Degrees</SelectLabel>
                            <SelectItem value="bs-computer-science">B.S. Computer Science</SelectItem>
                            <SelectItem value="bs-computer-information-systems">B.S. Information Systems</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Theme</label>
                <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      {/* SECTION 4: Account Management */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Account Management</CardTitle>
          <CardDescription className="text-destructive">Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
            <Button variant="destructive" className="justify-start">
                Delete Account
            </Button>
        </CardContent>
      </Card>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
