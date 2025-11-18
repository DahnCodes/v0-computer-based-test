'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AdminLogin() {
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!loginEmail || !loginPassword) {
        throw new Error('Please enter email and password')
      }

      const { data: adminUser, error: queryError } = await supabase
        .from('admin_users')
        .select('id, email, password_hash, is_active')
        .eq('email', loginEmail.trim())
        .single()

      if (queryError || !adminUser) {
        throw new Error('Invalid email or password')
      }

      if (!adminUser.is_active) {
        throw new Error('This admin account is inactive')
      }

      if (adminUser.password_hash !== loginPassword) {
        throw new Error('Invalid email or password')
      }

      localStorage.setItem('admin_id', adminUser.id)
      localStorage.setItem('admin_email', adminUser.email)
      router.push('/admin/dashboard')
    } catch (err) {
      console.log('[v0] Admin login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!signupEmail || !signupPassword || !signupConfirmPassword) {
        throw new Error('Please fill in all fields')
      }

      if (signupPassword !== signupConfirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (signupPassword.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', signupEmail.trim())
        .maybeSingle()

      if (existingAdmin) {
        throw new Error('This email is already registered as an admin')
      }

      const { data: newAdmin, error: insertError } = await supabase
        .from('admin_users')
        .insert([
          {
            email: signupEmail.trim(),
            password_hash: signupPassword, // In production, use bcrypt
            is_active: true,
          },
        ])
        .select()

      if (insertError) {
        console.log('[v0] Admin signup error:', insertError)
        throw insertError
      }

      if (newAdmin && newAdmin.length > 0) {
        localStorage.setItem('admin_id', newAdmin[0].id)
        localStorage.setItem('admin_email', newAdmin[0].email)
        router.push('/admin/dashboard')
      } else {
        throw new Error('Failed to create admin account')
      }
    } catch (err) {
      console.log('[v0] Admin signup error:', err)
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
        <CardDescription>Login or create a new admin account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
                />
              </div>

              {error && <div className="text-destructive text-sm">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  disabled={loading}
                />
              </div>

              {error && <div className="text-destructive text-sm">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Admin Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
