import { auth } from './auth';
import { supabase } from './supabase';

export async function getPokemons() {
  const { data, count, error } = await supabase.from('pokemons').select('* , pokemons_selling(*)');

  if (error) {
    console.error(error);
    throw new Error(error.message || 'Failed to get pokemons');
  }

  return { data, count };
}

export async function getPokemonById(id) {
  const { data, error } = await supabase
    .from('pokemons')
    .select('* , pokemons_selling(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message || 'Failed to get pokemon');
  }

  return data;
}

export async function getUser(email) {
  if (!email) return null;

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error(error.message || 'Failed to get user');
  }

  return data;
}

export async function createMember(newMember) {
  const { data, error } = await supabase.from('members').insert([newMember]).select().single();

  if (error) {
    console.error('Supabase error creating member:', error);
    throw new Error(error.message || 'Member could not be created');
  }

  return data;
}

export async function updateMember({ member, memberId }) {
  const { user } = await auth();
  console.log(
    `id in supabase:${JSON.stringify(user.id)}, id received from frontend:${memberId}, update data:${JSON.stringify(member)}`
  );
  if (memberId !== user.id) {
    throw new Error('You are not authorized to edit the user profile');
  }

  const { data, error } = await supabase
    .from('members')
    .update(member)
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    console.error('Supabase error updating member:', error);
    throw new Error(error.message || 'Member could not be updated');
  }

  return data;
}

export async function uploadImage({ filePath, image }) {
  const { user } = await auth(); // Note: user.id is bigint here

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, image);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(uploadError.message || 'Image could not be uploaded');
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function getCartItems() {
  const session = await auth();
  if (!session) return;
  if (session.user.id) {
    // session.user.id is bigint 11
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('member_id', session.user.id);

    if (error) {
      console.error('Supabase error getting cart items:', error);
      throw new Error(error.message || 'Failed to get cart items');
    }
    return data || [];
  }

  return [];
}

export async function addCartItems(item) {
  const session = await auth();
  if (!session) throw new Error('No session found');

  const { data, error } = await supabase
    .from('cart_items')
    .upsert([item], { onConflict: 'member_id, pokemon_id' }) // Handles add or update
    .select();

  if (error) {
    console.error('Supabase upsert error:', error);
    throw new Error(error.message || 'Failed to add or update cart item');
  }

  return data;
}

export async function updateCartItems(item) {
  const session = await auth();
  if (!item) return;

  if (item.member_id !== session.user.id)
    throw new Error('You are not authorized to update the cart item');

  const { data, error } = await supabase
    .from('cart_items')
    .update(item)
    .eq('member_id', session.user.id)
    .eq('pokemon_id', item.pokemon_id);

  if (error) {
    console.error('Supabase update error:', error);
    throw new Error(error.message || 'Failed to update cart item');
  }

  return data;
}

export async function deleteCartItems(item) {
  const session = await auth();
  if (!item) return;

  if (item.member_id !== session.user.id)
    throw new Error('You are not authorized to delete the cart item');

  const { data, error } = await supabase
    .from('cart_items')
    .delete()
    .eq('member_id', session.user.id)
    .eq('pokemon_id', item.pokemon_id);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(error.message || 'Failed to delete cart item');
  }

  return data;
}

const price_at_purchase = {};

export async function createOrder({ orderedItems }) {
  const session = await auth();

  if (!session.user) return;

  const {
    user: { id: userId },
  } = session;

  const billingAmount = await calculateBillingAmount(orderedItems);

  const {
    data: { order_id },
    error: creatingOrderError,
  } = await supabase
    .from('orders')
    .insert([
      { user_id: userId, total_amount: billingAmount, shipping_address: 'pending for submission' },
    ])
    .select()
    .single();

  if (creatingOrderError) {
    console.error('Error from supabase when creating order:', creatingOrderError);
    throw new Error(creatingOrderError.message || 'Failed to delete create the order');
  }

  if (!orderedItems) throw new Error('no item was submitted');

  const result = await Promise.allSettled(
    orderedItems.map(async (item) => {
      const { data, error: creatingOrderItemError } = await supabase
        .from('order_items')
        .insert([
          {
            order_id: order_id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: price_at_purchase[`${item.id}`],
          },
        ])
        .select()
        .single();

      if (creatingOrderItemError) {
        console.error(
          `Error from supabase when creating order items - ${item.product_id} : `,
          creatingOrderItemError
        );
        throw new Error(creatingOrderItemError.message || 'Failed to create the order items');
      }
    })
  );

  return { orderId: order_id, billingAmount };
}

export async function getInvoices() {
  const session = await auth();
  if (!session) return;

  if (session.user.id) {
    // session.user.id is bigint 11
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Supabase error loading user invoices:', error);
      throw new Error(error.message || 'Failed to load user invoices');
    }
    return data || [];
  }

  return [];
}

export async function updatePaymentStatus({ orderId, billingAddress, paymentStatus }) {
  console.log('billingAddress: ', billingAddress, orderId);
  if (paymentStatus === 'payment_intent.succeeded') {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', shipping_address: billingAddress })
      .eq('order_id', orderId);

    if (error) throw new Error(error.message);
  }
  // Add more cases later (e.g., failed payments)
}

export async function getOrderItemsByOrderId(orderId) {
  const session = await auth();

  if (!session.user) throw new Error('you have to login before placing order');

  const { data: orderDetails, error: validationError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId);

  if (validationError) {
    throw new Error(validationError.message);
  }

  if (orderDetails.at(0)?.user_id !== session.user.id)
    throw new Error('You are not allowed to retrieve the order details');

  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  return orderItems;
}

export async function calculateBillingAmount(orderedItems) {
  function deductDiscount(id, regularPrice, discount) {
    const priceAfterDiscount = (regularPrice * (100 - discount)) / 100;

    price_at_purchase[id] = priceAfterDiscount;

    return priceAfterDiscount;
  }
  const orderedQuantity = {};

  const selectedPokemonsId = orderedItems.map((pokemon) => {
    orderedQuantity[`${pokemon.id}`] = pokemon.quantity;
    return pokemon.id;
  });

  const { data: pokemonSellingInfo } = await supabase
    .from('pokemons_selling')
    .select('*')
    .in('reference_id', selectedPokemonsId);

  const billingAmount = pokemonSellingInfo.reduce(
    (sum, pokemon) =>
      sum +
      deductDiscount(pokemon.reference_id, pokemon.regular_price, pokemon.discount) *
        orderedQuantity[pokemon.reference_id],
    0
  );

  return billingAmount;
}
