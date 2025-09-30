import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
  // .eq('user_uid', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const newTransaction = await request.json();

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      { ...newTransaction, user_uid: user.id }
    ])
    .select()

  const { data: dataCash, error: Cash } = await supabase
    .from('cash')
    .select(`
      id,
      nominal,
      updated_at
      `)

  if (!dataCash || dataCash.length === 0) {
    return NextResponse.json({ error: 'No cash data found' }, { status: 404 })
  }

  const cashUpdate = newTransaction.type === 'outcome' ? parseInt(dataCash[0].nominal) - parseInt(newTransaction.amount) : parseInt(dataCash[0].nominal) + parseInt(newTransaction.amount);

  await supabase
    .from('cash')
    .update({ nominal: cashUpdate, updated_at: new Date().toISOString() })
    .eq('id', dataCash[0].id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
