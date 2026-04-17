"use client";

import * as React from "react";
import {
  IconDashboard,
  IconBook,
  IconPlus,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconClipboard,
  IconQuestionMark,
} from "@tabler/icons-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/instructor",
      icon: IconDashboard,
    },
    {
      title: "My Courses",
      url: "/dashboard/instructor/courses",
      icon: IconBook,
    },
    {
      title: "Students",
      url: "/dashboard/instructor/students",
      icon: IconUsers,
    },
    {
      title: "Assignments",
      url: "/dashboard/instructor/assignments",
      icon: IconClipboard,
    },
    {
      title: "Quizzes",
      url: "/dashboard/instructor/quizzes",
      icon: IconQuestionMark,
    },
    {
      title: "Analytics",
      url: "/dashboard/instructor/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/instructor/profile",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function InstructorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1! size-auto"
            >
              <Link href="/dashboard/instructor">
                <Image
                  src="/Cadivity.png"
                  alt="Cadivity Logo"
                  width={160}
                  height={30}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
