export interface ResumeListItem {
  id: number
  name: string
  email: string
}

export interface ResumeDetail {
  id: number
  name: string
  phone: string | null
  email: string
  website: string | null
  experience: string
  created_at: string
}

export interface ResumeFormData {
  name: string
  email: string
  phone: string
  website: string
  experience: string
}

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function fetchResumes(): Promise<ResumeListItem[]> {
  const res = await fetch('/api/resumes', { headers: getHeaders() })
  if (res.status === 401) throw new Error('unauthorized')
  if (!res.ok) throw new Error('Erro ao carregar currículos')
  return res.json()
}

export async function fetchResume(id: number | string): Promise<ResumeDetail> {
  const res = await fetch(`/api/resumes/${id}`, { headers: getHeaders() })
  if (res.status === 401) throw new Error('unauthorized')
  if (!res.ok) throw new Error('Currículo não encontrado')
  return res.json()
}

export async function createResume(data: ResumeFormData): Promise<{ id: number }> {
  const res = await fetch('/api/resumes', {
    method: 'POST',
    headers: getHeaders(),
    body: new URLSearchParams(data as unknown as Record<string, string>),
  })
  if (res.status === 401) throw new Error('unauthorized')
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.join('\n') || 'Erro ao cadastrar')
  return json
}

// --- Auth ---

export async function register(email: string, password: string) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function verifyEmail(email: string, code: string) {
  const res = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw json
  return json
}

export async function twoFactorAuthenticate(userId: number, code: string) {
  const res = await fetch('/api/auth/2fa/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function twoFactorSetup(password: string) {
  const res = await fetch('/api/auth/2fa/setup', {
    method: 'POST',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function twoFactorVerify(code: string) {
  const res = await fetch('/api/auth/2fa/verify', {
    method: 'POST',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function verifyResetCode(email: string, code: string) {
  const res = await fetch('/api/auth/verify-reset-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function forgotPassword(email: string) {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const res = await fetch('/api/auth/password', {
    method: 'PUT',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function fetchMe() {
  const res = await fetch('/api/auth/me', { headers: getHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function updateProfile(name: string) {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}
