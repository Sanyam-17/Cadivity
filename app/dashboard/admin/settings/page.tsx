"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useApi, useMutation } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import {
  Settings,
  Users,
  Bell,
  CreditCard,
  Tag,
  Save,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  User,
  KeyRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { authClient } from "@/lib/client/auth-client"

type TabId = "general" | "users" | "notifications" | "payments" | "categories" | "profile"

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "users", label: "Users", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "profile", label: "Profile", icon: User },
]

interface Category {
  id: string
  name: string
  courseCount: number
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("general")
  const { data: session } = authClient.useSession()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Settings" description="Configure your platform" />

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Tab Navigation */}
          <nav className="flex lg:flex-col lg:w-52 gap-1 overflow-x-auto lg:overflow-x-visible border-b lg:border-b-0 lg:border-r border-border pb-2 lg:pb-0 lg:pr-4 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "general" && <GeneralTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "payments" && <PaymentsTab />}
            {activeTab === "categories" && <CategoriesTab />}
            {activeTab === "profile" && <ProfileTab session={session} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function GeneralTab() {
  const [form, setForm] = React.useState({
    platformName: "Cadivity",
    contactEmail: "support@cadivity.com",
    language: "en",
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
        <h3 className="text-subheading">Platform Settings</h3>
        <div className="space-y-2">
          <Label>Platform Name</Label>
          <Input value={form.platformName} onChange={(e) => setForm(f => ({ ...f, platformName: e.target.value }))} className="input-focus-ring" />
        </div>
        <div className="space-y-2">
          <Label>Contact Email</Label>
          <Input type="email" value={form.contactEmail} onChange={(e) => setForm(f => ({ ...f, contactEmail: e.target.value }))} className="input-focus-ring" />
        </div>
        <div className="space-y-2">
          <Label>Default Language</Label>
          <Select value={form.language} onValueChange={(v) => setForm(f => ({ ...f, language: v }))}>
            <SelectTrigger className="input-focus-ring"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("Settings saved")}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

function UsersTab() {
  const [settings, setSettings] = React.useState({
    selfRegistration: true,
    emailVerification: true,
    minPasswordLength: 8,
    defaultRole: "student",
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
        <h3 className="text-subheading">User Settings</h3>
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4">
          <div><p className="text-sm font-medium">Allow Self-Registration</p><p className="text-xs text-muted-foreground mt-0.5">Students can create accounts</p></div>
          <Switch checked={settings.selfRegistration} onCheckedChange={(v) => setSettings(s => ({ ...s, selfRegistration: v }))} />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4">
          <div><p className="text-sm font-medium">Require Email Verification</p><p className="text-xs text-muted-foreground mt-0.5">Verify email before access</p></div>
          <Switch checked={settings.emailVerification} onCheckedChange={(v) => setSettings(s => ({ ...s, emailVerification: v }))} />
        </div>
        <div className="space-y-2">
          <Label>Minimum Password Length</Label>
          <Input type="number" min={6} max={32} value={settings.minPasswordLength} onChange={(e) => setSettings(s => ({ ...s, minPasswordLength: parseInt(e.target.value) || 8 }))} className="input-focus-ring w-24" />
        </div>
        <div className="space-y-2">
          <Label>Default Role</Label>
          <Select value={settings.defaultRole} onValueChange={(v) => setSettings(s => ({ ...s, defaultRole: v }))}>
            <SelectTrigger className="input-focus-ring w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("User settings saved")}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [settings, setSettings] = React.useState({
    enrollmentEmail: true,
    completionEmail: true,
    newRegistrationAlert: true,
    senderName: "Cadivity",
    senderEmail: "noreply@cadivity.com",
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
        <h3 className="text-subheading">Email Notifications</h3>
        {[
          { key: "enrollmentEmail", label: "Enrollment Confirmation", desc: "Send email when a student enrolls" },
          { key: "completionEmail", label: "Course Completion", desc: "Send email when a course is completed" },
          { key: "newRegistrationAlert", label: "New Registration Alert", desc: "Notify admins of new signups" },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4">
            <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground mt-0.5">{desc}</p></div>
            <Switch checked={(settings as any)[key]} onCheckedChange={(v) => setSettings(s => ({ ...s, [key]: v }))} />
          </div>
        ))}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Sender Name</Label>
            <Input value={settings.senderName} onChange={(e) => setSettings(s => ({ ...s, senderName: e.target.value }))} className="input-focus-ring" />
          </div>
          <div className="space-y-2">
            <Label>Sender Email</Label>
            <Input value={settings.senderEmail} onChange={(e) => setSettings(s => ({ ...s, senderEmail: e.target.value }))} className="input-focus-ring" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("Notification settings saved")}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

function PaymentsTab() {
  const [copied, setCopied] = React.useState(false)
  const webhookUrl = "https://cadivity.com/api/webhooks/payments"

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
        <h3 className="text-subheading">Payment Configuration</h3>
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4">
          <div><p className="text-sm font-medium">Free-Only Mode</p><p className="text-xs text-muted-foreground mt-0.5">All courses are free, no payment processing</p></div>
          <Switch defaultChecked />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select defaultValue="usd">
            <SelectTrigger className="input-focus-ring w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD ($)</SelectItem>
              <SelectItem value="inr">INR (₹)</SelectItem>
              <SelectItem value="eur">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
        <h3 className="text-subheading">Payment Gateway</h3>
        <div className="space-y-2">
          <Label>Stripe Secret Key</Label>
          <Input type="password" placeholder="sk_live_•••••••••••••••••" className="input-focus-ring" />
        </div>
        <div className="space-y-2">
          <Label>Stripe Publishable Key</Label>
          <Input type="password" placeholder="pk_live_•••••••••••••••••" className="input-focus-ring" />
        </div>
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <div className="flex items-center gap-2">
            <Input value={webhookUrl} readOnly className="bg-secondary border-0 text-sm" />
            <Button variant="outline" size="icon" className="shrink-0 h-9 w-9" onClick={copyWebhookUrl}>
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("Payment settings saved")}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

function CategoriesTab() {
  const [newCategory, setNewCategory] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editName, setEditName] = React.useState("")
  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null)

  const { data: categories, loading, refetch } = useApi<Category[]>({ url: "/api/admin/categories" })

  const { mutate, loading: mutating } = useMutation({
    onSuccess: () => { refetch(); setNewCategory(""); setEditingId(null) },
    onError: (err) => toast.error(err),
  })

  const handleAdd = async () => {
    if (!newCategory.trim()) return
    await mutate("/api/admin/categories", { method: "POST", body: JSON.stringify({ name: newCategory.trim() }) })
    toast.success("Category added")
  }

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return
    await mutate("/api/admin/categories", { method: "PATCH", body: JSON.stringify({ id, name: editName.trim() }) })
    toast.success("Category updated")
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await mutate("/api/admin/categories", { method: "DELETE", body: JSON.stringify({ id: deleteTarget.id }) })
    toast.success("Category deleted")
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-subheading">Course Categories</h3>
        </div>

        {/* Add new */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="input-focus-ring"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} disabled={mutating || !newCategory.trim()}>
            <Plus className="mr-2 h-3.5 w-3.5" />Add
          </Button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded skeleton-shimmer" />
            ))}
          </div>
        ) : !categories || categories.length === 0 ? (
          <EmptyState icon={Tag} title="No categories" description="Create your first category to organize courses." />
        ) : (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-3 row-hover hover:bg-muted/50">
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-focus-ring h-8 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && handleEdit(cat.id)} />
                    <Button size="sm" className="h-8" onClick={() => handleEdit(cat.id)}>Save</Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.courseCount} course{cat.courseCount !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(cat)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description={deleteTarget?.courseCount ? `This category has ${deleteTarget.courseCount} course(s). Reassign them first.` : "This category will be permanently deleted."}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={mutating}
      />
    </div>
  )
}

function ProfileTab({ session }: { session: any }) {
  const user = session?.user
  const [form, setForm] = React.useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
        <h3 className="text-subheading">Profile Information</h3>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input-focus-ring" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="input-focus-ring" />
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("Profile updated")}><Save className="mr-2 h-4 w-4" />Save Profile</Button>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
        <h3 className="text-subheading">Change Password</h3>
        <div className="space-y-2">
          <Label>Current Password</Label>
          <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} className="input-focus-ring" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} className="input-focus-ring" />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} className="input-focus-ring" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => toast.success("Password changed")}><KeyRound className="mr-2 h-4 w-4" />Change Password</Button>
        </div>
      </div>
    </div>
  )
}

