'use server';

import { revalidatePath } from 'next/cache';
import { auth, signIn, signOut } from './auth';
import {
  addCartItems,
  createOrder,
  deleteCartItems,
  getCartItems,
  getPokemons,
  getUser,
  updateCartItems,
  updateMember,
  uploadImage,
} from './data-service';

export async function handleSignOut() {
  await signOut({ redirectTo: '/' });
}

export async function handleSignIn() {
  await signIn('google', { redirectTo: '/account' });
}

export async function getUserAction(email) {
  return await getUser(email);
}

export async function updateMemberAction(formData) {
  if (!formData) {
    throw new Error('no data is provided');
  }

  const session = await auth();
  if (!session) {
    throw new Error('You must be logged in to update your profile.');
  }

  const { id } = await getUser(session.user.email);
  const image = formData?.get('image');
  let finalImagePath;

  // Check if a new file was uploaded (it will be a File object)
  if (image instanceof File && image.size > 0) {
    const filePath = `profile/${id}-${Math.random()}-${image.name?.replaceAll(/\s/g, '-')}`;

    finalImagePath = await uploadImage({ filePath, image });
  } else {
    // If no new file, use the existing image URL (which is a string)
    finalImagePath = image;
  }

  const updatedData = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    gender: formData.get('gender'),
    address: formData.get('address'),
    // Use the finalImagePath directly
    image: finalImagePath,
  };

  await updateMember({ member: updatedData, memberId: id });

  revalidatePath('/account/profile');
}

export async function getPokemonAction() {
  return await getPokemons();
}

export async function updateCartItemsAction(items) {
  const session = await auth();
  if (!session || !items) return;

  if (!Array.isArray(items)) throw new Error('no cart item was passed');

  const existingCartItems = await getCartItems();

  const controllerMap = new Map();
  const action = new Map();
  existingCartItems.forEach((existingItem) => {
    controllerMap.set(existingItem.pokemon_id, existingItem.quantity);
  });

  // Mark existing items not in new list for delete
  existingCartItems.forEach((existingItem) => {
    if (!items.some((newItem) => newItem.id === existingItem.pokemon_id)) {
      action.set(existingItem.pokemon_id, 'delete');
    }
  });

  // Handle adding or updating from new items
  items.forEach((newItem) => {
    if (!controllerMap.has(newItem.id)) {
      // Add new
      controllerMap.set(newItem.id, newItem.quantity);
      action.set(newItem.id, 'add');
    } else {
      // Update if quantity changed
      const existingQuantity = controllerMap.get(newItem.id);
      if (newItem.quantity !== existingQuantity) {
        controllerMap.set(newItem.id, newItem.quantity);
        action.set(newItem.id, 'update');
      }
      // If same, do nothing (no action set)
    }
  });

  // Process actions sequentially with await
  for (const [id, actType] of action.entries()) {
    const pokemon_id = Number(id); // Safer than parseInt
    if (isNaN(pokemon_id)) {
      console.error('Invalid ID detected:', id);
      throw new Error('Invalid pokemon ID: ' + id); // Catch bad IDs early
    }
    switch (actType) {
      case 'add':
        try {
          const quantity = controllerMap.get(id);
          await addCartItems({
            pokemon_id,
            quantity,
            member_id: session.user.id,
          });
        } catch (err) {
          console.error(err);
          throw new Error(
            `Error ${actType === 'add' ? 'adding' : 'updating'} pokemon: ${err.message}`
          );
        }
        break;

      case 'update': // Use same function for add/update (assuming upsert)
        try {
          const quantity = controllerMap.get(id);
          await updateCartItems({
            pokemon_id,
            quantity,
            member_id: session.user.id,
          });
        } catch (err) {
          console.error(err);
          throw new Error(
            `Error ${actType === 'add' ? 'adding' : 'updating'} pokemon: ${err.message}`
          );
        }
        break;

      case 'delete':
        try {
          await deleteCartItems({
            pokemon_id,
            member_id: session.user.id,
          });
        } catch (err) {
          console.error(err);
          throw new Error(`Error deleting pokemon: ${err.message}`);
        }
        break;
    }
  }

  // Revalidate the cart page after changes
  revalidatePath('/cart'); // Adjust path if needed
}

export async function createOrderAction(items) {
  return await createOrder(items);
}

