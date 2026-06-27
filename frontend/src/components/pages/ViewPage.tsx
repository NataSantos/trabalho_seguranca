import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ExternalLink, MapPin, Calendar, Briefcase, FileText } from 'lucide-react'
import { fetchResume, type ResumeDetail } from '@/services/api'

export default function ViewPage() {
  const router = useRouter()
  const id = router.query.id
  const [resume, setResume] = useState<ResumeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!router.isReady) return
    if (!id || Array.isArray(id)) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setResume(null)
    setNotFound(false)
    setLoading(true)
    fetchResume(id)
      .then(setResume)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, router.isReady])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (notFound || !resume) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Currículo não encontrado.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para listagem
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Cabeçalho com nome e contato */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              {/* PROTEÇÃO XSS: React escapa {} */}
              <h1 className="text-xl font-bold tracking-tight">{resume.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {resume.email}
                </span>
                {resume.phone && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {resume.phone}
                  </span>
                )}
              </div>
            </div>
            <Badge className="bg-white/15 text-white border-0 text-xs">#{resume.id}</Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Website */}
          {resume.website && /^https?:\/\//.test(resume.website) && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Website</h3>
              <a
                href={resume.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {resume.website}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Experiência */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Experiência Profissional
            </h3>
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
              {resume.experience}
            </div>
          </div>

          {/* Data de cadastro */}
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Cadastrado em {resume.created_at}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
