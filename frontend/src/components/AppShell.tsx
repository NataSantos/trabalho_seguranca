import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { FileText, Plus, List, LogOut, Shield } from 'lucide-react'
import LoginPage from '@/components/pages/LoginPage'

const navItems = [
  { to: '/', label: 'Listagem', icon: List },
  { to: '/cadastro', label: 'Novo Currículo', icon: Plus },
]

function ShellContent({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  const publicRoutes = ['/login', '/register', '/verify-email']
  const isPublicRoute = publicRoutes.includes(router.pathname)
  const success = Array.isArray(router.query.success) ? router.query.success[0] : router.query.success

  useEffect(() => {
    if (!router.isReady) return

    if (router.pathname === '/' && success === '1') {
      toast.success('Currículo cadastrado com sucesso!', {
        duration: 4000,
        position: 'top-right',
        style: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' },
      })
      void router.replace('/', undefined, { shallow: true })
    }
  }, [router.isReady, router.pathname, success])

  useEffect(() => {
    if (!router.isReady) return
    if (user && isPublicRoute) {
      void router.replace('/')
    }
  }, [router.isReady, user, isPublicRoute])

  if (loading) return null

  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
        <Toaster richColors closeButton />
        <LoginPage />
      </div>
    )
  }

  if (!user && isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
        <Toaster richColors closeButton />
        {children}
      </div>
    )
  }

  if (user && isPublicRoute) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Toaster richColors closeButton />

      <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/20 p-1.5">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-slate-100">Currículos</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(item => {
            const active = router.pathname === item.to
            return (
              <Button
                key={item.to}
                variant={active ? 'secondary' : 'ghost'}
                size="sm"
                className={`w-full justify-start gap-2.5 text-sm ${
                  active
                    ? 'bg-primary/20 text-primary-foreground hover:bg-primary/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                }`}
                asChild
              >
                <Link href={item.to}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-800 p-3">
          {user && (
            <div className="px-2">
              <p className="truncate text-xs text-slate-400">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="outline" className="h-4 border-slate-600 px-1 text-[9px] text-slate-400">
                  {user.two_factor_enabled ? '2FA ativo' : '2FA inativo'}
                </Badge>
              </div>
            </div>
          )}
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="flex-1 justify-start text-xs text-slate-400 hover:text-slate-100 h-7" asChild>
              <Link href="/2fa-setup"><Shield className="mr-1 h-3 w-3" /> 2FA</Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-red-400" onClick={logout}>
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-6">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ShellContent>{children}</ShellContent>
    </AuthProvider>
  )
}
