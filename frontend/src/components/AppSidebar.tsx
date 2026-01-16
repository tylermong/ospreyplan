"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Settings } from "lucide-react";
import { NavItems } from "@/components/nav-items";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from "@/components/ui/sidebar";
import Image from "next/image";
import { useUser } from "@/providers/UserProvider";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { user, loading } = useUser();

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
                  <Image
                    src="/ospreyplan-black-transparent.png"
                    alt="OspreyPlan"
                    width={32}
                    height={32}
                    className="dark:hidden"
                    priority
                  />
                  <Image
                    src="/ospreyplan-white-transparent.png"
                    alt="OspreyPlan"
                    width={32}
                    height={32}
                    className="hidden dark:block"
                    priority
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
        {loading ? (
           <div className="p-2">
               <div className="flex items-center gap-2 rounded-md p-2">
                   <Skeleton className="h-8 w-8 rounded-lg" />
                   <div className="flex-1 space-y-1">
                       <Skeleton className="h-3 w-20" />
                       <Skeleton className="h-2 w-16" />
                   </div>
               </div>
           </div>
        ) : (
           <NavUser user={user ?? fallbackUserData} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
