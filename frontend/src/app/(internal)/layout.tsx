import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "sonner";
import { UserProvider, User } from "@/providers/UserProvider";
import { fetchFromServer } from "@/lib/server-api";

async function getUser(): Promise<User | null> {
  try {
    const data = await fetchFromServer("/auth/me");
    if (!data) return null;
    
    return {
      name: data.user_metadata.full_name,
      email: data.user_metadata.email,
      avatar: data.user_metadata.avatar_url,
    };
  } catch {
    // If auth fails on server, we pass null. Client might try again or redirect.
    return null;
  }
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <UserProvider initialUser={user}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger className="mt-2 ml-2 cursor-pointer" />
          {children}
        </main>
        <Toaster />
      </SidebarProvider>
    </UserProvider>
  );
}
