import { requireAuth } from "@/lib/server/auth-guard";

export default async function StudentDashboard() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-neutral-400">
          Welcome, {session.user.name}! Your learning dashboard is coming soon.
        </p>
      </div>
    </div>
  );
}

