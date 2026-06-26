import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { forgotPassword, verifyResetCode, resetPassword } from '@/services/api'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await forgotPassword(email)
      setStep('code')
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar recuperação.')
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await verifyResetCode(email, code)
      setStep('password')
    } catch (err: any) {
      setError(err.message || 'Código inválido.')
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem.')
      setLoading(false)
      return
    }

    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setError('Nova senha deve ter no mínimo 6 caracteres, uma letra maiúscula e um caractere especial.')
      setLoading(false)
      return
    }

    try {
      await resetPassword(email, code, newPassword)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <div className="rounded-full bg-primary/10 p-2 w-fit mx-auto mb-2">
            {step === 'email' ? <Mail className="h-5 w-5 text-primary" /> :
             step === 'code' ? <ShieldCheck className="h-5 w-5 text-primary" /> :
             step === 'password' ? <KeyRound className="h-5 w-5 text-primary" /> :
             <KeyRound className="h-5 w-5 text-primary" />}
          </div>
          <CardTitle className="text-base">
            {step === 'email' ? 'Recuperar Senha' :
             step === 'code' ? 'Verificar Código' :
             step === 'password' ? 'Nova Senha' :
             'Senha Redefinida'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {step === 'success' ? (
            <div className="text-center py-4">
              <p className="text-sm text-emerald-600 font-medium">Senha redefinida com sucesso!</p>
              <p className="text-xs text-muted-foreground mt-1">
                <Link to="/login" className="text-primary hover:underline">Voltar para o login</Link>
              </p>
            </div>
          ) : step === 'email' ? (
            <>
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Digite seu e-mail para receber um código de recuperação.
              </p>
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-8 text-sm" required />
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-4">
                <Link to="/login" className="text-primary hover:underline">Voltar para o login</Link>
              </p>
            </>
          ) : step === 'code' ? (
            <>
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Digite o código enviado para <strong>{email}</strong>.
              </p>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs">Código de Recuperação</Label>
                  <Input id="code" value={code} onChange={e => setCode(e.target.value)} className="h-8 text-sm text-center tracking-widest" maxLength={6} placeholder="000000" required />
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Código verificado! Escolha uma nova senha.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs">Nova senha (mín. 6 caracteres, 1 maiúscula, 1 especial)</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-8 text-sm" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs">Confirmar nova senha</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-8 text-sm" required />
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
