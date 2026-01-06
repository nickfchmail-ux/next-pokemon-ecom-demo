'use client';
import { useMutation } from '@tanstack/react-query';
import { motion, useInView } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItemsAction } from '../_lib/actions';
import { synchronizeRemoteCartData } from '../_state/_global/cart/CartSlice';
import useGetPokemon from '../_state/_remote/pokemon/useGetPokemon';
import Loading from '../loading';
import CartItem from './CartItem';
import NoCartItemsNotice from './NoCartItemsNotice';
import ThankYouForShoppingMessage from './ThankYouForShoppingMessage';
const animation = {
  visible: { opacity: 1, transition: { type: 'spring', damping: 12, stiffness: 100 } },
  hidden: { opacity: 0 },
};

export default function CartList({ cartData }) {
  const [hasDoneInitailCartUpdate, setHasDoneInitailCartUpdate] = useState(false);
  const containerViewCheckPort = useRef(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { root: containerViewCheckPort });

  const [expand, setExpand] = useState(false);
  const searchParams = useSearchParams();
  const tags = searchParams.getAll('tag');
  const headerRef = useRef(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);
  const hasJustBroughtProducts = useSelector((state) => state.cart.broughtProducts);

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
    if (!cartData) return;
    const previousCartItems = cartData.map((item) => ({
      id: item.pokemon_id,
      quantity: item.quantity,
    }));

    dispatch(synchronizeRemoteCartData(previousCartItems));
    setHasDoneInitailCartUpdate(true);
  }, []);

  useEffect(() => {
    if (!hasDoneInitailCartUpdate) return;
    if (cart?.length >= 0) {
      updatePokemon(cart);
    }
  }, [cart]);

  const { pokemonList = [], isLoadingPokemon, errorForLoadingPokemon } = useGetPokemon();

  if (isLoadingPokemon) return <Loading />;
  if (!cart?.length > 0 && hasJustBroughtProducts) return <ThankYouForShoppingMessage />;
  if (!cart?.length > 0) return <NoCartItemsNotice />;

  const selectedPokemons = cart.map((selectedPokemon) =>
    pokemonList.filter((pokemon) => pokemon.id === selectedPokemon.id).at(0)
  );

  return (
    <div
      ref={containerViewCheckPort}
      className={`flex flex-col   overflow-y-scroll overflow-x-hidden space-y-2.5`}
    >
      {selectedPokemons.map((selectedPokemon) => (
        <motion.div
          key={selectedPokemon.name}
          variants={animation}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.5 }}
          layout
          exit={{ opacity: 0 }}
        >
          <CartItem
            key={selectedPokemon.name}
            item={selectedPokemon}
            isInview={isInView}
            ref={ref}
          />
        </motion.div>
      ))}
    </div>
  );
}
