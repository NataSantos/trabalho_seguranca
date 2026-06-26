import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ShieldCheck, Lock, KeyRound, User, Pencil } from 'lucide-react'
import { changePassword, twoFactorSetup, twoFactorVerify, updateProfile } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

type Tab = 'password' | '2fa'

export default function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, login, token } = useAuth()
  const [tab, setTab] = useState<Tab>('password')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)

  async function handleSaveName() {
    if (!nameInput.trim()) return
    setSavingName(true)
    try {
      await updateProfile(nameInput.trim())
      if (user && token) {
        login(token, { ...user, name: nameInput.trim() })
      }
      setEditingName(false)
    } catch {
    } finally {
      setSavingName(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex items-center gap-2 mb-2">
        <User className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold">Perfil</h2>
      </div>

      <div className="mb-4 pl-7">
        {editingName ? (
          <div className="flex items-center gap-1">
            <Input value={nameInput} onChange={e => setNameInput(e.target.value)} className="h-7 text-sm flex-1" />
            <Button size="sm" className="h-7 text-xs px-2" onClick={handleSaveName} disabled={savingName}>Salvar</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => { setEditingName(false); setNameInput(user?.name || '') }}>Cancelar</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">{user?.name || user?.email?.split('@')[0]}</span>
            <button onClick={() => { setEditingName(true); setNameInput(user?.name || '') }} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={tab === 'password' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setTab('password')}
        >
          <KeyRound className="h-3.5 w-3.5 mr-1" /> Senha
        </Button>
        <Button
          size="sm"
          variant={tab === '2fa' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setTab('2fa')}
        >
          <ShieldCheck className="h-3.5 w-3.5 mr-1" /> 2FA
        </Button>
      </div>

      {tab === 'password' ? <ChangePasswordSection /> : <TwoFactorSection />}
    </Dialog>
  )
}

function ChangePasswordSection() {
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
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {success && (
        <Alert className="mb-4 py-2 border-emerald-500 text-emerald-700 bg-emerald-50">
          <AlertDescription className="text-xs">Senha alterada com sucesso!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="currentPassword" className="text-xs">Senha atual</Label>
          <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-8 text-sm" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="newPassword" className="text-xs">Nova senha (mín. 6, 1 maiúscula, 1 especial)</Label>
          <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-8 text-sm" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-xs">Confirmar nova senha</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-8 text-sm" required />
        </div>
        <Button type="submit" size="sm" className="w-full" disabled={loading}>
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </Button>
      </form>
    </div>
  )
}

function TwoFactorSection() {
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
      setLoading(false)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Código inválido.')
      setLoading(false)
    }
  }

  return (
    <div>
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
          <p className="text-xs text-muted-foreground mb-3 text-center">
            Digite sua senha para configurar a autenticação em duas etapas.
          </p>
          <form onSubmit={handlePassword} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="2fa-password" className="text-xs">Senha atual</Label>
              <Input id="2fa-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-8 text-sm" required />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Confirmar Senha'}
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center mb-3">
            <img src={qrCode} alt="QR Code 2FA" className="w-36 h-36 mb-1" />
            <p className="text-[10px] text-muted-foreground text-center">
              Escaneie com Google Authenticator
            </p>
          </div>

          {secret && (
            <div className="bg-muted rounded p-2 mb-3 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Ou digite a chave:</p>
              <code className="text-xs font-mono break-all">{secret}</code>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="2fa-code" className="text-xs">Código de verificação</Label>
              <Input id="2fa-code" value={code} onChange={e => setCode(e.target.value)} className="h-8 text-sm text-center tracking-widest" maxLength={6} placeholder="000000" required />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Ativar 2FA'}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
