"use client"

import * as React from "react"
import {
  IconDashboard,
  IconListDetails,
  IconSchool,
  IconUsers,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { useSignOut } from "@/hooks/use-signout"
import { size } from "zod"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
      size: "lg",
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: IconListDetails,
      size: "lg",
    },
    {
      title: "Instructors",
      url: "/admin/instructors",
      icon: IconSchool,
      size: "lg",
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: IconUsers,
      size: "lg",
    },
    {
      title: "All Users",
      url: "/admin/users",
      icon: IconUsers,
      size: "lg",
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
      icon: IconListDetails,
      size: "lg",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const handleSignOut = useSignOut();

  const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Logout",
      url: "#",
      icon: IconLogout,
      onClick: handleSignOut,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props} className="border-r border-slate-100">
      <SidebarHeader className="bg-[#f2f7ff] pt-6 px-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col items-start gap-1 pb-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Image
                  src="/Cadivity.png"
                  alt="Cadivity Logo"
                  width={200}
                  height={80}
                  className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
                  priority
                />
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[#f2f7ff] px-3 pt-6">
        <NavMain items={data.navMain} />
        <NavSecondary items={navSecondary} className="mt-auto pb-6" />
      </SidebarContent>
      <SidebarFooter className="bg-[#f2f7ff] border-t border-slate-200/50 p-4">
      </SidebarFooter>
    </Sidebar>
  )
}
