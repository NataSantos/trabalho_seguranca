import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, UserPlus } from 'lucide-react'
import { register } from '@/services/api'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Senhas não conferem.')
      setLoading(false)
      return
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Senha deve ter no mínimo 6 caracteres, uma letra maiúscula e um caractere especial.')
      setLoading(false)
      return
    }

    try {
      const data = await register(email, password)
      await router.push({ pathname: '/verify-email', query: { email, code: data.code } })
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <div className="rounded-full bg-primary/10 p-2 w-fit mx-auto mb-2">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base">Cadastro</CardTitle>
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
              <Label htmlFor="password" className="text-xs">Senha (mín. 6 caracteres, 1 maiúscula, 1 especial)</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-8 text-sm" minLength={6} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs">Confirmar Senha</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-8 text-sm" minLength={6} required />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Já tem conta? <Link href="/login" className="text-primary hover:underline">Entrar</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
