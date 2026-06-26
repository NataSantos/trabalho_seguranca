import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ShieldCheck, Lock } from 'lucide-react'
import { twoFactorSetup, twoFactorVerify } from '@/services/api'

export default function TwoFactorSetupPage() {
  const [step, setStep] = useState<'password' | 'setup' | 'success'>('password')
  const [password, setPassword] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await twoFactorSetup(password)
      setQrCode(data.qrcode)
      setSecret(data.secret)
      setStep('setup')
    } catch (err: any) {
      setError(err.message || 'Senha inválida.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await twoFactorVerify(code)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Código inválido.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="rounded-full bg-primary/10 p-2 w-fit mx-auto mb-2">
            {step === 'password' ? <Lock className="h-5 w-5 text-primary" /> : <ShieldCheck className="h-5 w-5 text-primary" />}
          </div>
          <CardTitle className="text-base">
            {step === 'password' ? 'Confirmar Senha' : step === 'setup' ? 'Autenticação em Duas Etapas' : '2FA Ativado'}
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
              <p className="text-sm text-emerald-600 font-medium">2FA ativado com sucesso!</p>
            </div>
          ) : step === 'password' ? (
            <>
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Digite sua senha atual para configurar a autenticação em duas etapas.
              </p>
              <form onSubmit={handlePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Senha atual</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-8 text-sm" required />
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Confirmar Senha'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center mb-4">
                <img src={qrCode} alt="QR Code 2FA" className="w-40 h-40 mb-2" />
                <p className="text-[10px] text-muted-foreground text-center">
                  Escaneie com Google Authenticator ou similar
                </p>
              </div>

              {secret && (
                <div className="bg-muted rounded p-2 mb-4 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Ou digite a chave manualmente:</p>
                  <code className="text-xs font-mono break-all">{secret}</code>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs">Código de verificação</Label>
                  <Input id="code" value={code} onChange={e => setCode(e.target.value)} className="h-8 text-sm text-center tracking-widest" maxLength={6} placeholder="000000" required />
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Ativar 2FA'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
