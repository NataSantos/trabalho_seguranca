import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { useEffect, useState } from 'react'
import ProfileModal from '@/components/ProfileModal'
import { Button } from '@/components/ui/button'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { FileText, Plus, List, LogOut, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import ListPage from '@/components/pages/ListPage'
import FormPage from '@/components/pages/FormPage'
import ViewPage from '@/components/pages/ViewPage'
import LoginPage from '@/components/pages/LoginPage'
import RegisterPage from '@/components/pages/RegisterPage'
import VerifyEmailPage from '@/components/pages/VerifyEmailPage'
import ForgotPasswordPage from '@/components/pages/ForgotPasswordPage'


const navItems = [
  { to: '/', label: 'Listagem', icon: List },
  { to: '/cadastro', label: 'Novo Currículo', icon: Plus },
]

function AppContent() {
  const location = useLocation()
  const { user, token, loading, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
  const publicRoutes = ['/login', '/register', '/verify-email', '/recuperar-senha']
  if (!token && publicRoutes.includes(location.pathname)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
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

      <aside className={`fixed left-0 top-0 z-40 h-screen ${sidebarCollapsed ? 'w-14' : 'w-56'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200`}>
        <div className="p-3 border-b border-slate-800">
          <Link to="/" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="rounded-lg bg-primary/20 p-1.5">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            {!sidebarCollapsed && <span className="font-semibold text-sm text-slate-100">Currículos</span>}
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to
            return (
              <Button
                key={item.to}
                variant={active ? 'secondary' : 'ghost'}
                size="sm"
                className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-2.5'} text-sm ${
                  active
                    ? 'bg-primary/20 text-primary-foreground hover:bg-primary/30'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                }`}
                asChild
              >
                <Link to={item.to}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && item.label}
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="p-2 border-t border-slate-800 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-2'} text-slate-400 text-xs h-8 hover:text-slate-100`}
            onClick={() => setProfileOpen(true)}
            title={sidebarCollapsed ? user?.email : undefined}
          >
            <User className="h-3.5 w-3.5 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Perfil</span>}
          </Button>
          {sidebarCollapsed ? (
            <button onClick={() => setSidebarCollapsed(false)} className="w-full flex justify-center py-1 text-slate-500 hover:text-slate-300 transition-colors">
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 text-slate-400 text-xs h-8 hover:text-red-400" onClick={logout}>
                <LogOut className="h-3.5 w-3.5 shrink-0" /> Sair
              </Button>
              <button onClick={() => setSidebarCollapsed(true)} className="text-slate-500 hover:text-slate-300 transition-colors px-1">
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className={`flex-1 ${sidebarCollapsed ? 'ml-14' : 'ml-56'} p-6 transition-all duration-200`}>
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/cadastro" element={<FormPage />} />
            <Route path="/visualizar/:id" element={<ViewPage />} />

          </Routes>
        </div>
      </main>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
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
