'use client';

import CreditCardIcon from '@mui/icons-material/CreditCard';
import DiscountIcon from '@mui/icons-material/Discount';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { createOrderAction } from '../_lib/actions';
import { clearCart, setBroughtProducts } from '../_state/_global/cart/CartSlice';
import useGetPokemon from '../_state/_remote/pokemon/useGetPokemon';
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
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cart);
  const { pokemonList } = useGetPokemon();

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: createOrderAction,
    onSuccess: (data) => {
      console.log(JSON.stringify(data));
      toast.success(`Order (${data})  has been created`);
      dispatch(clearCart());
      dispatch(setBroughtProducts(true));
    },
    onError: (err) => {
      toast.error(`failed to create the order: ${err}`);
    },
  });

  if (!pokemonList || pokemonList.length === 0) {
    return <div className="text-center py-8">Your cart is empty or loading...</div>;
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

  if (!cartItems?.length > 0) return null;

  const orderList = cartItems.map((selectedPokemon) => {
    const order = pokemonList.filter((pokemon) => {
      return pokemon.id === selectedPokemon.id;
    });

    const { id, pokemons_selling } = order.at(0);
    const quantity = selectedPokemon.quantity;

    const price_at_purchase =
      (pokemons_selling.regular_price * (100 - pokemons_selling.discount)) / 100;

    return { product_id: id, quantity, price_at_purchase };
  });

  return (
    <div className="w-full h-min md:h-full bg-gray-50 shadow-lg px-6 flex items-center  items-end">
      <ul className=" text-lg w-full">
        <li className="flex justify-center border-b py-2 gap-x-2">
          <Image src={`/pokeball.png`} width={20} height={15} alt="pokeball" />x
          <span className="font-semibold">{totalQuantity}</span>
        </li>
        <li className="flex justify-between border-b ">
          <span>
            <MonetizationOnIcon />
          </span>
          <span className="font-semibold">${totalRegularPrice.toFixed(2)}</span>
        </li>
        <li className="flex justify-between border-b ">
          <span>
            <DiscountIcon />
          </span>
          <span className="font-semibold text-red-500">-${totalDiscountSavings.toFixed(2)}</span>
        </li>
        <li className="flex justify-between   ">
          <span>
            <CreditCardIcon />
          </span>
          <span className=" text-green-400 flex place-items-center font-semibold">
            ${billingAmount.toFixed(2)}
          </span>
        </li>
        <li className={`flex justify-between py-5`}>
          <ClearCartButton />
          <Button
            variant="outlined"
            type="submit"
            color="success"
            className=" text-lg p-6  transition-colors rounded-md mt-6 h-min w-[10rem]"
            onClick={(e) => {
              e.preventDefault();
              createOrder({
                orderSummary: {
                  user_id: user.id,
                  total_amount: billingAmount,
                  shipping_address: { address: 'test' },
                },
                orderedItems: orderList,
              });
            }}
          >
            {isPending ? <CircularProgress size="20px" /> : 'Pay'}
          </Button>
        </li>
      </ul>
    </div>
  );
}
