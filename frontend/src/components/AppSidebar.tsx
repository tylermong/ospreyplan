"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Monitor, Settings } from "lucide-react";
import { NavItems } from "@/components/nav-items";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from "@/components/ui/sidebar";

const items = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: Monitor,
  },
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
      .catch(() => {});
  }, []);

  const fallbackUserData = {
    name: "OspreyPlan User",
    email: "",
    avatar: "/avatars/shadcn.jpg",
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
              <Link href="/dashboard" className="flex items-center gap-2">
                <img
                  src="/ospreyplan-black-transparent.png"
                  alt="OspreyPlan"
                  width={32}
                  height={32}
                />
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
