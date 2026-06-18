import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { FileText, Plus, List, LogOut, Shield } from 'lucide-react'
import ListPage from '@/components/pages/ListPage'
import FormPage from '@/components/pages/FormPage'
import ViewPage from '@/components/pages/ViewPage'
import LoginPage from '@/components/pages/LoginPage'
import RegisterPage from '@/components/pages/RegisterPage'
import VerifyEmailPage from '@/components/pages/VerifyEmailPage'
import TwoFactorSetupPage from '@/components/pages/TwoFactorSetupPage'

const navItems = [
  { to: '/', label: 'Listagem', icon: List },
  { to: '/cadastro', label: 'Novo Currículo', icon: Plus },
]

function AppContent() {
  const location = useLocation()
  const { user, token, loading, logout } = useAuth()
  const showSuccess = location.state?.success

  useEffect(() => {
    if (showSuccess) {
      toast.success('Currículo cadastrado com sucesso!', {
        duration: 4000,
        position: 'top-right',
        style: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' },
      })
    }
  }, [showSuccess])

  if (loading) return null

  // Rotas públicas (login, register, verify-email) - mostradas sem sidebar
  const publicRoutes = ['/login', '/register', '/verify-email']
  if (!token && publicRoutes.includes(location.pathname)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </div>
    )
  }

  // Se não tem token, redireciona para login
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </div>
    )
  }

  // Se está autenticado mas visitou rota pública, redireciona
  if (publicRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />
  }

  // Rotas autenticadas com sidebar
  return (
    <div className="flex min-h-screen">
      <Toaster richColors closeButton />

      <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/20 p-1.5">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-sm text-slate-100">Currículos</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to
            return (
              <Button
                key={item.to}
                variant={active ? 'secondary' : 'ghost'}
                size="sm"
                className={`w-full justify-start gap-2.5 text-sm ${
                  active
                    ? 'bg-primary/20 text-primary-foreground hover:bg-primary/30'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                }`}
                asChild
              >
                <Link to={item.to}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          {user && (
            <div className="px-2">
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className="text-[9px] h-4 px-1 border-slate-600 text-slate-400">
                  {user.two_factor_enabled ? '2FA ativo' : '2FA inativo'}
                </Badge>
              </div>
            </div>
          )}
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="flex-1 justify-start text-slate-400 text-xs h-7 hover:text-slate-100" asChild>
              <Link to="/2fa-setup"><Shield className="h-3 w-3 mr-1" /> 2FA</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 text-xs h-7 hover:text-red-400" onClick={logout}>
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-6">
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/cadastro" element={<FormPage />} />
            <Route path="/visualizar/:id" element={<ViewPage />} />
            <Route path="/2fa-setup" element={<TwoFactorSetupPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
