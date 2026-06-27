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

/**
 * Auth cookie (httpOnly) is sent automatically by the browser
 * when credentials: 'include' is set. No need to manually attach
 * Authorization headers — this prevents XSS from stealing the token.
 */
const API_BASE = '/api'

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  return res
}

export async function fetchResumes(): Promise<ResumeListItem[]> {
  const res = await apiFetch('/resumes')
  if (res.status === 401) throw new Error('unauthorized')
  if (!res.ok) throw new Error('Erro ao carregar currículos')
  return res.json()
}

export async function fetchResume(id: number | string): Promise<ResumeDetail> {
  const res = await apiFetch(`/resumes/${id}`)
  if (res.status === 401) throw new Error('unauthorized')
  if (!res.ok) throw new Error('Currículo não encontrado')
  return res.json()
}

export async function createResume(data: ResumeFormData): Promise<{ id: number }> {
  const res = await apiFetch('/resumes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (res.status === 401) throw new Error('unauthorized')
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.join('\n') || 'Erro ao cadastrar')
  return json
}

// --- Auth ---

export async function register(email: string, password: string) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function verifyEmail(email: string, code: string) {
  const res = await apiFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function login(email: string, password: string) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw json
  return json
}

export async function twoFactorAuthenticate(userId: number, code: string) {
  const res = await apiFetch('/auth/2fa/authenticate', {
    method: 'POST',
    body: JSON.stringify({ userId, code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function twoFactorSetup(password: string) {
  const res = await apiFetch('/auth/2fa/setup', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function twoFactorVerify(code: string) {
  const res = await apiFetch('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function verifyResetCode(email: string, code: string) {
  const res = await apiFetch('/auth/verify-reset-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function forgotPassword(email: string) {
  const res = await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  const res = await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const res = await apiFetch('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function fetchMe() {
  const res = await apiFetch('/auth/me')
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}

export async function updateProfile(name: string) {
  const res = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json
}
