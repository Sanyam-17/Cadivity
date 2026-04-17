import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authClient } from "@/lib/auth-client"
import { Search, Bell, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  title?: string
  description?: string
  searchPlaceholder?: string
}

export function AdminHeader({ title, description, searchPlaceholder }: AdminHeaderProps) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-14">
      <div className="flex flex-3 items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder || "Search..."}
            className="w-full bg-slate-50/50 pl-10 h-10 border-slate-100 rounded-xl focus-visible:ring-[#00a3ff]/20 placeholder:text-slate-400 text-sm font-medium"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-[#ff4d4d] border-2 border-white"></span>
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-100 ml-2">
          {!isPending && session ? (
            <>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-[#1a2233] leading-none uppercase tracking-tighter">
                  {session.user.name || session.user.email.split("@")[0]}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Admin Console
                </span>
              </div>
              <Avatar className="h-9 w-9 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                <AvatarImage src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`} />
                <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                  {session.user.name?.charAt(0) || session.user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </>
          ) : (
            <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-xl" />
          )}
        </div>
      </div>
    </header>
  )
}
