import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, MailCheck } from 'lucide-react'
import { verifyEmail } from '@/services/api'

export default function VerifyEmailPage() {
  const router = useRouter()
  const email = typeof router.query.email === 'string' ? router.query.email : ''
  const codeParam = Array.isArray(router.query.code) ? router.query.code[0] : router.query.code
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!router.isReady) return
    if (typeof codeParam === 'string') {
      setCode(codeParam)
    }
  }, [router.isReady, codeParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await verifyEmail(email, code)
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      setError(err.message || 'Código inválido.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <div className="rounded-full bg-primary/10 p-2 w-fit mx-auto mb-2">
            <MailCheck className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base">Verificar E-mail</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <p className="text-sm text-emerald-600 font-medium">E-mail verificado com sucesso!</p>
              <p className="text-xs text-muted-foreground mt-1">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Enviamos um código de verificação para <strong>{email}</strong>
              </p>

              {error && (
                <Alert variant="destructive" className="mb-4 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs">Código de Verificação</Label>
                  <Input id="code" value={code} onChange={e => setCode(e.target.value)} className="h-8 text-sm text-center tracking-widest" maxLength={6} placeholder="000000" required />
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
