'use client';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItemsAction } from '../_lib/actions';
import {
  saveLocalStorageDataToCartWhenNotLoggedIn,
  synchronizeRemoteCartData,
} from '../_state/_global/cart/CartSlice';
import useGetPokemon from '../_state/_remote/pokemon/useGetPokemon';
import Loading from '../loading';
import CartItem from './CartItem';
import NoCartItemsNotice from './NoCartItemsNotice';
export default function CartList({ children, user }) {
  const [expand, setExpand] = useState(false);
  const searchParams = useSearchParams();
  const tags = searchParams.getAll('tag');
  const headerRef = useRef(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);

  useEffect(() => {
    const localCartStr = localStorage.getItem('Poke芒Cart');
    if (localCartStr?.length > 0) {
      const localCartParsed = JSON.parse(localCartStr);
      dispatch(saveLocalStorageDataToCartWhenNotLoggedIn(localCartParsed));
      localStorage.removeItem('Poke芒Cart');
    }
  }, []); // Runs only on mount

  const {
    mutate: updatePokemon,
    isPending,
    isError,
    error: updateError,
  } = useMutation({
    mutationFn: updateCartItemsAction,
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  useEffect(() => {
    if (!children || cart) return;
    const previousCartItems = children.map((item) => ({
      id: item.pokemon_id,
      quantity: item.quantity,
    }));
    console.log('previousCartItems: ', previousCartItems);
    dispatch(synchronizeRemoteCartData(previousCartItems));
  }, []);

  useEffect(() => {
    if (!user) {
      const existingCartItems = JSON.parse(localStorage.getItem('Poke芒Cart')) || []; // Get array or empty
      const controllerMap = new Map();
      const action = new Map();
      existingCartItems.forEach((existingItem) => {
        controllerMap.set(existingItem.id, existingItem.quantity);
      });
      // Mark existing items not in new list for delete
      existingCartItems.forEach((existingItem) => {
        if (!cart.some((newItem) => newItem.id === existingItem.id)) {
          action.set(existingItem.id, 'delete');
        }
      });
      // Handle adding or updating from new items
      cart.forEach((newItem) => {
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
        }
      });
      // Build the updated cart array
      let updatedCart = [];
      controllerMap.forEach((quantity, id) => {
        if (action.get(id) !== 'delete') {
          updatedCart.push({ id, quantity });
        }
      });
      localStorage.setItem('Poke芒Cart', JSON.stringify(updatedCart)); // Save back the array
      // Only dispatch if needed, but avoid direct loop
      if (JSON.stringify(cart) !== JSON.stringify(updatedCart)) {
        dispatch(saveLocalStorageDataToCartWhenNotLoggedIn(updatedCart));
      }
    }
  }, [cart, user]); // Run when cart or user changes

  useEffect(() => {
    if (cart?.length >= 0) {
      updatePokemon(cart);
    }
  }, [cart]);

  const { pokemonList = [], isLoadingPokemon, errorForLoadingPokemon } = useGetPokemon();

  if (isLoadingPokemon) return <Loading />;

  if (!cart?.length > 0) return <NoCartItemsNotice />;

  return (
    <div className={`flex flex-col   bg-cyan-200 overflow-y-scroll overflow-x-hidden`}>
      {cart.map((item) => {
        const selectedPokemon = pokemonList?.filter((pokemon) => pokemon.id === item.id).at(0);

        return <CartItem key={item.id} item={selectedPokemon} />;
      })}
    </div>
  );
}
