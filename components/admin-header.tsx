'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  adminEmail: string
}

export function AdminHeader({ adminEmail }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('admin_id')
    localStorage.removeItem('admin_email')
    router.push('/admin')
  }

  return (
    <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground border-b">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm opacity-90">Logged in as {adminEmail}</p>
      </div>
      <Button
        variant="outline"
        onClick={handleLogout}
        className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
      >
        Logout
      </Button>
    </div>
  )
}
