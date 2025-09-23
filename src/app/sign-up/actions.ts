'use server'

// import { revalidatePath } from 'next/cache'
// import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'


export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // redirect('/login')
}

export async function generateExampleData(user_uid: string) {
  const supabase = createClient()
}