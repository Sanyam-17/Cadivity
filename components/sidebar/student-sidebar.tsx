"use client";

import * as React from "react";
import {
  IconDashboard,
  IconBook,
  IconSearch,
  IconClipboard,
  IconQuestionMark,
  IconCertificate,
  IconSettings,
  IconHelp,
  IconBell,
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
      url: "/dashboard/student",
      icon: IconDashboard,
    },
    {
      title: "My Courses",
      url: "/dashboard/student/courses",
      icon: IconBook,
    },
    {
      title: "Browse Courses",
      url: "/courses",
      icon: IconSearch,
    },
    {
      title: "Assignments",
      url: "/dashboard/student/assignments",
      icon: IconClipboard,
    },
    {
      title: "Quizzes",
      url: "/dashboard/student/quizzes",
      icon: IconQuestionMark,
    },
    {
      title: "Certificates",
      url: "/dashboard/student/certificates",
      icon: IconCertificate,
    },
    {
      title: "Notifications",
      url: "/dashboard/student/notifications",
      icon: IconBell,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/student/profile",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
};

export function StudentSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1! size-auto"
            >
              <Link href="/">
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
