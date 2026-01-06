"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";

let cachedDegree: string | null = null;

export default function Settings({ initialSettings }: { initialSettings?: { degree?: string } | null }) {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Academic State
  const [degree, setDegree] = useState<string | null>(initialSettings?.degree ?? cachedDegree);
  const [loadingDegree, setLoadingDegree] = useState(!initialSettings && !cachedDegree);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSettings) {
        cachedDegree = initialSettings.degree ?? null;
        setLoadingDegree(false);
        return;
    }
    if (cachedDegree) {
        setLoadingDegree(false);
        return;
    }

    let mounted = true;
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    async function fetchData() {
      try {
        // Fetch Settings
        const settingsRes = await fetch(`${apiBase}/api/settings`, { credentials: "include" });
        if (settingsRes.ok) {
          const body = await settingsRes.json();
          if (mounted) {
            setDegree(body.degree ?? null);
            cachedDegree = body.degree ?? null;
          }
        }
      } catch {
        if (mounted) setError("Failed to load settings.");
      } finally {
        if (mounted) setLoadingDegree(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [initialSettings]);

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
        cachedDegree = payload.degree ?? null;
    } catch {
        setError("Failed to save changes.");
    }
  }

  async function handleDeleteAccount() {
    if (deleting) return;
    setDeleting(true);
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    try {
        const res = await fetch(`${apiBase}/auth/me`, {
            method: "DELETE",
            credentials: "include",
        });
        
        if (res.ok) {
            setDeleteDialogOpen(false);
            window.location.href = "/"; // Force hard reload to clear context
            return;
        }
        setError("Failed to delete account. Please try again.");
        setDeleteDialogOpen(false);
    } catch {
        setError("Failed to delete account. Please try again.");
        setDeleteDialogOpen(false);
    } finally {
        setDeleting(false);
    }
  }

  if (userLoading || loadingDegree) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Separator />
        
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {i === 1 && <Skeleton className="h-20 w-20 rounded-full" />}
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full max-w-sm" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.substring(0,2).toUpperCase() ?? "OP"}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-medium text-lg">{user?.name || "Guest User"}</h4>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
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
                    <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Degrees</SelectLabel>
                            <SelectItem value="bs-computer-science" className="cursor-pointer">B.S. Computer Science</SelectItem>
                            <SelectItem value="bs-computer-information-systems" className="cursor-pointer">B.S. Information Systems</SelectItem>
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
                    <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light" className="cursor-pointer">Light</SelectItem>
                        <SelectItem value="dark" className="cursor-pointer">Dark</SelectItem>
                        <SelectItem value="system" className="cursor-pointer">System</SelectItem>
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
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="justify-start cursor-pointer">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting} className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    void handleDeleteAccount();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
