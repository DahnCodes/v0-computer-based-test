import { AdminLogin } from '@/components/admin-login'

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Quiz Management System</p>
        </div>
        <AdminLogin />
      </div>
    </main>
  )
}
