import { requireAdmin } from "@/lib/auth-guard";
import { Mail, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default async function AdminDashboard() {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Profile Card */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-slate-100">
          {/* Gradient Header Strip */}
          <div className="h-32 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute -bottom-px left-0 right-0 h-8 bg-white rounded-t-3xl" />
          </div>

          {/* Avatar */}
          <div className="flex justify-center -mt-16 relative z-10">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/30 ring-4 ring-white">
              {session.user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pt-5 pb-8 text-center space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {session.user.name}
              </h2>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" />
                Administrator
              </div>
            </div>

            {/* Email Info */}
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>

            {/* Logout */}
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
