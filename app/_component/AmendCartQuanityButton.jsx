'use client';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useDispatch, useSelector } from 'react-redux';
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from '../_state/_global/cart/CartSlice';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { updateCartItemsAction } from '../_lib/actions';

export default function AmendCartQuanityButton({ id, view }) {
  const [hasDoneInitialCartUpdate, setHasDoneInitialCartUpdate] = useState(false); // Fixed typo
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart.cart);
  const hasAlreadyAddToCart = cart.filter((pokemon) => pokemon.id === id).length > 0;

  const {
    mutate: updatePokemon,
    isPending,
    isError,
    error: updateError,
  } = useMutation({
    mutationFn: updateCartItemsAction,
    onSuccess: (data) => {},
    onError: (err) => {},
  });

  useEffect(() => {
    if (cart?.length >= 0) {
      updatePokemon(cart);
    }
  }, [cart]); // Added dependency

  if (!hasAlreadyAddToCart) return null;

  return (
    <div className={`flex gap-x-3 flex-wrap `}>
      <div
        className={`flex w-full gap-1 place-items-center ${view?.toLowerCase() === 'detail' ? 'text-primary-200' : 'text-primary-700'} `}
      >
        <button
          className={`hover:text-blue-500 active:scale-95`}
          onClick={() => dispatch(incrementQuantity({ id: id }))}
        >
          <i className="pi pi-cart-plus" style={{ fontSize: '1.5rem' }}></i>
        </button>
        <button
          className={`hover:text-red-500 active:scale-95`}
          onClick={() => dispatch(decrementQuantity({ id: id }))}
        >
          <i className="pi pi-cart-minus " style={{ fontSize: '1.5rem' }}></i>
        </button>

        <button
          className={` hover:text-red-400 active:scale-95 flex place-items-center px-2 px-1 rounded-2xl mb-1`}
          onClick={() => dispatch(removeFromCart({ id: id }))}
        >
          <DeleteOutlineIcon />
        </button>
      </div>
    </div>
  );
}
