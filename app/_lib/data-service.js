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

  const { data, error } = await supabase.from('members').select('*').eq('email', email).single();

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
  console.log('member id: ', item.member_id);
  console.log('user id: ', session.user.id);
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
