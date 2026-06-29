const CMS_URL = process.env.PAYLOAD_CMS_URL

export async function fetchFromCMS<T>(path: string, revalidate = 60): Promise<T> {
  if (!CMS_URL) {
    throw new Error('PAYLOAD_CMS_URL environment variable is not set')
  }
  const apiKey = process.env.PAYLOAD_API_KEY
  const res = await fetch(`${CMS_URL}${path}`, {
    next: { revalidate },
    headers: apiKey ? { Authorization: `users API-Key ${apiKey}` } : {},
  })
  if (!res.ok) {
    throw new Error(`CMS fetch error ${res.status} ${res.statusText}: ${path}`)
  }
  return res.json() as Promise<T>
}

export async function mutateOnCMS<T>(
  path: string,
  method: 'POST' | 'PATCH',
  body: unknown,
): Promise<T> {
  if (!CMS_URL) throw new Error('PAYLOAD_CMS_URL environment variable is not set')

  const apiKey = process.env.PAYLOAD_API_KEY
  const res = await fetch(`${CMS_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `users API-Key ${apiKey}` } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`CMS mutate error ${res.status} ${res.statusText}: ${path} — ${text}`)
  }

  return res.json() as Promise<T>
}
