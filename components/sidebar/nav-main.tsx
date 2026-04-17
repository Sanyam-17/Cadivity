"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

import { usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-4">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url));
            
            return (
              <SidebarMenuItem key={item.title} className="px-2">
                <SidebarMenuButton 
                  tooltip={item.title} 
                  asChild
                  className={isActive 
                    ? "bg-blue-50/80 text-[#0088cc] font-black hover:bg-blue-50 hover:text-[#0088cc] h-12 rounded-xl text-[15px]" 
                    : "text-slate-600 font-semibold hover:bg-slate-50 h-12 rounded-xl text-[15px]"}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    {item.icon && <item.icon size={22} className={isActive ? "text-[#0088cc] stroke-[2.5]" : "text-slate-400 stroke-[2]"} />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#0088cc] rounded-r-full shadow-[2px_0_8px_rgba(0,136,204,0.3)]" />
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
