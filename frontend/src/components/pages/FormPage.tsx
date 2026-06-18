import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { createResume, type ResumeFormData } from '@/services/api'

export default function FormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ResumeFormData>({
    name: '', email: '', phone: '', website: '', experience: '',
  })
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors([])

    try {
      await createResume(form)
      navigate('/', { state: { success: true } })
    } catch (err: any) {
      setErrors(err.message.split('\n'))
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-t-4 border-t-emerald-500/70">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Novo Currículo</CardTitle>
      </CardHeader>
      <CardContent>
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-5 py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Corrija os erros:</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 mt-1 text-xs space-y-0.5">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Nome *</Label>
              <Input id="name" name="name" maxLength={100} value={form.name} onChange={handleChange} className="h-8 text-sm" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">E-mail *</Label>
              <Input id="email" name="email" type="email" maxLength={200} value={form.email} onChange={handleChange} className="h-8 text-sm" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">
                Telefone <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input id="phone" name="phone" maxLength={20} value={form.phone} onChange={handleChange} className="h-8 text-sm" placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs">
                Endereço WEB <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input id="website" name="website" type="url" maxLength={500} value={form.website} onChange={handleChange} className="h-8 text-sm" placeholder="https://exemplo.com" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="experience" className="text-xs">Experiência Profissional *</Label>
            <Textarea id="experience" name="experience" maxLength={3000} value={form.experience} onChange={handleChange} className="min-h-[140px] text-sm" required />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => navigate('/')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
