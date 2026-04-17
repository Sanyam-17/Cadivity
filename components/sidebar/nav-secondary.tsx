"use client"

import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { usePathname } from "next/navigation"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
    onClick?: () => void
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu className="gap-3">
          {items.map((item) => {
            const isActive = pathname === item.url;
            
            return (
              <SidebarMenuItem key={item.title} className="px-2">
                <SidebarMenuButton 
                  asChild 
                  className={isActive 
                    ? "bg-blue-50/80 text-[#0088cc] font-black hover:bg-blue-50 hover:text-[#0088cc] h-12 rounded-xl text-[15px]" 
                    : "text-slate-600 font-semibold hover:bg-slate-50 h-12 rounded-xl text-[15px]"}
                >
                  {item.onClick ? (
                    <button onClick={item.onClick} className="flex items-center gap-3 w-full">
                      <item.icon size={22} className={isActive ? "text-[#0088cc] stroke-[2.5]" : "text-slate-400 stroke-[2]"} />
                      <span>{item.title}</span>
                    </button>
                  ) : (
                    <a href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon size={22} className={isActive ? "text-[#0088cc] stroke-[2.5]" : "text-slate-400 stroke-[2]"} />
                      <span>{item.title}</span>
                    </a>
                  )}
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
