import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      user_uid,
      status,
      created_at
      `)
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

  const { paymentMethodId, products, total } = await request.json();

  try {
    // Insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        total_amount: total,
        user_uid: user.id,
        status: 'completed'
      })
      .select('*')
      .single();

    if (orderError) {
      throw orderError;
    }

    // Insert the order items
    const orderItems = products.map((product: { id: number, quantity: number, price: number }) => ({
      order_id: orderData.id,
      product_id: product.id,
      quantity: product.quantity,
      price: product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // If there's an error inserting order items, delete the order
      await supabase.from('orders').delete().eq('id', orderData.id);
      throw itemsError;
    }

    // Insert the transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        order_id: orderData.id,
        payment_method_id: paymentMethodId,
        amount: total,
        user_uid: user.id,
        status: 'completed',
        category: 'selling',
        type: 'income',
        description: `Payment for order #${orderData.id}`
      });

    if (transactionError) {
      // If there's an error inserting the transaction, delete the order and order items
      await supabase.from('orders').delete().eq('id', orderData.id);
      await supabase.from('order_items').delete().eq('order_id', orderData.id);
      throw transactionError;
    }

    //update cash on hand
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

    const cashUpdate = parseInt(dataCash[0].nominal) + parseInt(total);
    await supabase
      .from('cash')
      .update({ nominal: cashUpdate, updated_at: new Date().toISOString() })
      .eq('id', dataCash[0].id)
      .single()


    return NextResponse.json(orderData);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
