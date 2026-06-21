import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get('Authorization')
  const secret = process.env.REVALIDATE_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { paths?: string[]; slug?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const paths = body.paths ?? (body.slug ? [`/catalogo/${body.slug}`, '/catalogo'] : [])

  for (const path of paths) {
    revalidatePath(path)
  }

  return NextResponse.json({ revalidated: paths })
}
