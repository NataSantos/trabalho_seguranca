import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, KeyRound } from 'lucide-react'
import { changePassword } from '@/services/api'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
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
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="rounded-full bg-primary/10 p-2 w-fit mx-auto mb-2">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base">Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <p className="text-sm text-emerald-600 font-medium">Senha alterada com sucesso!</p>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs">Senha atual</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-8 text-sm" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs">Nova senha (mín. 6 caracteres, 1 maiúscula, 1 especial)</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-8 text-sm" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs">Confirmar nova senha</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-8 text-sm" required />
                </div>

                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
