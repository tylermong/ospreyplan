"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { CalendarDays, Settings } from "lucide-react";
import { NavItems } from "@/components/nav-items";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from "@/components/ui/sidebar";
import Image from "next/image";

const items = [
  {
    name: "Planner",
    url: "/planner",
    icon: CalendarDays,
  },
  {
    name: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [user, setUser] = React.useState<{ name: string; email: string; avatar: string; } | null>(null);

  React.useEffect(() => {
    const apiBase =
      process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
    fetch(`${apiBase}/auth/me`, { method: "GET", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("not authenticated");
        return res.json();
      })
      .then((u) => {
        setUser({
          name: u.user_metadata.full_name,
          email: u.user_metadata.email,
          avatar: u.user_metadata.avatar_url,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch user data for sidebar", error);
      });
  }, []);

  const fallbackUserData = {
    name: "OspreyPlan User",
    email: "",
    avatar: "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
                <Link href="/planner" className="flex items-center gap-2">
                {mounted ? (
                  <Image
                    src={
                      resolvedTheme === "dark"
                        ? "/ospreyplan-white-transparent.png"
                        : "/ospreyplan-black-transparent.png"
                    }
                    alt="OspreyPlan"
                    width={32}
                    height={32}
                    priority
                  />
                ) : (
                  <div className="w-8 h-8" /> // Placeholder to prevent layout shift
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-xl">OspreyPlan</span>
                </div>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ?? fallbackUserData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
