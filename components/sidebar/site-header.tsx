"use client";

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Search, Bell, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export function SiteHeader() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-4 px-4 lg:gap-6 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent hidden md:block">
            Cadivity
          </h1>
        </div>

        {/* Search Bar matching image */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search task..." 
            className="pl-10 bg-muted/50 border-none rounded-full h-10 ring-offset-background focus-visible:ring-1"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
            <Mail className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
          </Button>
          <div className="flex items-center gap-3 pl-2 border-l ml-2">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-semibold leading-none">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-accent p-0.5 overflow-hidden">
              <img 
                src={user?.image || "https://github.com/shadcn.png"} 
                alt="Profile" 
                className="h-full w-full rounded-full border-2 border-background object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
