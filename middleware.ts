import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Skip if Supabase is not configured (development/POC without credentials)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl === 'your_supabase_url' || !supabaseKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Protect /dashboard — requires auth
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!user) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/onboarding/registro'
        return NextResponse.redirect(redirectUrl)
      }
    }
  } catch {
    // Auth check failed — allow request through in development
    return NextResponse.next({ request })
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
