'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BookOpen, Users, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/quizzes', label: 'Quizzes', icon: BookOpen },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/attempts', label: 'Attempts', icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-card border-r p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-secondary'
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
