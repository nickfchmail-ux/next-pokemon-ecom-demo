'use client';

import Button from '@mui/material/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrderAction } from '../_lib/actions';
import useGetPokemon from '../_state/_remote/pokemon/useGetPokemon';
import Loading from '../loading';
import ClearCartButton from './ClearCartButton';
import LoginNavigation from './LoginNavigation';
// Official Pokémon type colors
const TYPE_COLORS = {
  NORMAL: '#A8A77A',
  FIRE: '#EE8130',
  WATER: '#6390F0',
  ELECTRIC: '#F7D02C',
  GRASS: '#7AC74C',
  ICE: '#96D9D6',
  FIGHTING: '#C22E28',
  POISON: '#A33EA1',
  GROUND: '#E2BF65',
  FLYING: '#A98FF3',
  PSYCHIC: '#F95587',
  BUG: '#A6B91A',
  ROCK: '#B6A136',
  GHOST: '#735797',
  DRAGON: '#6F35FC',
  DARK: '#705746',
  STEEL: '#B7B7CE',
  FAIRY: '#D685AD',
};
export default function CartSummary({ user }) {
  if (!user) return <LoginNavigation />;
  const queryClient = useQueryClient();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cart);
  const { pokemonList } = useGetPokemon();

  const [orderId, setOrderId] = useState(null);

  const {
    mutateAsync: createOrder,
    isLoading: isLoadingStripePayment,
    isError,
    error,
  } = useMutation({
    mutationFn: createOrderAction,
    onSuccess: (data) => {
      // Optionally refresh cached queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      const params = new URLSearchParams();

      params.set('orderId', data.orderId);

      router.push(`/checkout?${params.toString()}`);
    },
  });

  if (!pokemonList || pokemonList.length === 0) {
    return (
      <div className="text-center py-8">
        <Loading />
      </div>
    );
  }

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartMap = {};
  cartItems.forEach((item) => {
    cartMap[item.id] = item.quantity;
  });

  // Pricing calculations
  let totalRegularPrice = 0;
  let totalDiscountSavings = 0;
  let billingAmount = 0;

  pokemonList.forEach((pokemon) => {
    const quantity = cartMap[pokemon.id] || 0;
    if (quantity === 0) return;

    const regularPrice = pokemon.pokemons_selling.regular_price;
    const discountPercent = pokemon.pokemons_selling.discount;

    const itemRegularTotal = regularPrice * quantity;
    const itemDiscountAmount = itemRegularTotal * (discountPercent / 100);
    const itemFinalPrice = itemRegularTotal - itemDiscountAmount;

    totalRegularPrice += itemRegularTotal;
    totalDiscountSavings += itemDiscountAmount;
    billingAmount += itemFinalPrice;
  });

  if (cartItems.length === 0) return null;

  const handleProceedToCheckout = () => {
    const params = new URLSearchParams();

    createOrder({ orderedItems: cartItems });
  };

  if (isLoadingStripePayment) return <Loading />;

  return (
    <div className="w-full h-min md:h-full bg-gray-50 shadow-lg px-6 flex items-center items-end">
      <ul className="text-lg w-full">
        <li className="flex justify-center border-b py-2 gap-x-2">
          <Image src={`/pokeball.png`} width={20} height={15} alt="pokeball" />
          <span className="font-semibold text-black">x {totalQuantity}</span>
        </li>
        <li className="flex justify-between border-b">
          <span className="text-black">Regular</span>
          <span className="font-semibold text-black">${totalRegularPrice.toFixed(2)}</span>
        </li>
        <li className="flex justify-between border-b">
          <span className="text-black">Discount</span>
          <span className="font-semibold text-red-500">-${totalDiscountSavings.toFixed(2)}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-black">Total</span>
          <span className="text-green-400 flex place-items-center font-semibold">
            ${billingAmount.toFixed(2)}
          </span>
        </li>
        <li className="flex justify-between py-5">
          <ClearCartButton />
          <Button
            variant="outlined"
            color="success"
            className="text-lg p-6 transition-colors rounded-md mt-6 h-min w-[10rem]"
            onClick={handleProceedToCheckout}
          >
            Pay
          </Button>
        </li>
      </ul>
    </div>
  );
}
