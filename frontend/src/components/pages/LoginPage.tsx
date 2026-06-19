import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, LogIn } from 'lucide-react'
import { login as apiLogin, twoFactorAuthenticate } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false)
  const [userId2FA, setUserId2FA] = useState(0)
  const [twoFactorCode, setTwoFactorCode] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await apiLogin(email, password)
      if (data.requiresTwoFactor) {
        setRequires2FA(true)
        setUserId2FA(data.userId)
        setLoading(false)
        return
      }
      login(data.token, data.user)
      await router.push('/')
    } catch (err: any) {
      setError(err.error || 'Erro ao fazer login.')
      setLoading(false)
    }
  }

  async function handle2FA(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await twoFactorAuthenticate(userId2FA, twoFactorCode)
      login(data.token, data.user)
      await router.push('/')
    } catch (err: any) {
      setError(err.message || 'Código inválido.')
      setLoading(false)
    }
  }

  if (requires2FA) {
    return (
      <div className="max-w-sm mx-auto mt-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-base">Autenticação em Duas Etapas</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handle2FA} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="2fa" className="text-xs">Código 2FA</Label>
                <Input id="2fa" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} placeholder="000000" className="h-8 text-center text-sm tracking-widest" maxLength={6} required />
              </div>
              <Button type="submit" size="sm" className="w-full" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <div className="rounded-full bg-primary/10 p-2 w-fit mx-auto mb-2">
            <LogIn className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base">Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-8 text-sm" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-8 text-sm" required />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Não tem conta? <Link href="/register" className="text-primary hover:underline">Cadastre-se</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
