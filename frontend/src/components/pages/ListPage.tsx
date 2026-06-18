import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchResumes, type ResumeListItem } from '@/services/api'
import { FileText, Eye, Mail, User } from 'lucide-react'

export default function ListPage() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResumes()
      .then(setResumes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Currículos</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-t-4 border-t-primary/70">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-md bg-primary/10 p-1.5">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base">Currículos</CardTitle>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{resumes.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <FileText className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Nenhum currículo cadastrado.</p>
            <Button size="sm" asChild>
              <Link to="/cadastro">Cadastrar</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {resumes.map(r => (
              <div
                key={r.id}
                className="group rounded-lg border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/30 hover:bg-primary/[0.02]"
              >
                <div className="space-y-1 mb-3">
                  <h3 className="text-sm font-semibold leading-none flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary/60" />
                    {r.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {r.email}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full h-7 text-xs" asChild>
                  <Link to={`/visualizar/${r.id}`}>
                    <Eye className="h-3 w-3 mr-1" /> Visualizar
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
