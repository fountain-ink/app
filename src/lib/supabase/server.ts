import { env } from '@/env'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database'

export async function createClient() {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7 // 1 week
            })
          } catch (error) {
            console.error('Error setting cookie:', error)
            throw new Error('Failed to set authentication cookie')
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: -1, // Expire immediately
              expires: new Date(0), 
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true
            })
          } catch (error) {
            console.error('Error removing cookie:', error)
            throw new Error('Failed to remove authentication cookie')
          }
        },
      },
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
      },
      global: {
        headers: {
          'x-application-name': 'fountain',
        },
      },
    }
  )

  return supabase
}
