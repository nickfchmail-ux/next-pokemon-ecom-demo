'use client';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItemsAction } from '../_lib/actions';
import { getPokemons } from '../_lib/data-client-service';
import {
  saveLocalStorageDataToCartWhenNotLoggedIn,
  synchronizeRemoteCartData,
} from '../_state/_global/cart/CartSlice';
import Loading from '../loading';
import ExpandButton from './ExpandButton';
import FilterCount from './FilterCount';
import MobileFilter from './MobileFilter';
import PokemonCard from './PokemonCard';
import TagFilter from './TagFilter';

export default function InfinitePokemonList({ user, children }) {
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
    if (cart?.length >= 0) {
      updatePokemon(cart);
    }
  }, [cart]);

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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ['pokemons', tags],
    queryFn: ({ pageParam }) => getPokemons({ pageParam, species: tags }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (headerRef.current) {
      document.addEventListener(
        'click',
        (e) => {
          if (expand && headerRef.current && !headerRef.current.contains(e.target)) {
            setExpand(false);
          }
        },
        true
      );
    }
  }, [expand, headerRef]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <Loading />;
  if (status === 'error') return <div>Error: {error.message}</div>;

  const pokemons = data.pages.flatMap((page) => page.pokemons);
  const totalCount = data?.pages[0]?.totalCount ?? 0; // Same on every page
  const specialSpecies = data?.pages[0]?.speciesList ?? [];

  return (
    <>
      <div className="h-[87vh] flex flex-col">
        <header
          ref={headerRef}
          className="hidden pt-2 flex-col-reverse bg-gray-800 text-white md:flex sm:flex-col-reverse md:flex-row justify-evenly place-items-baseline"
        >
          <TagFilter expand={expand} specialSpecies={specialSpecies} />
          <ExpandButton expand={expand} setExpand={setExpand} />
          <FilterCount displayedPokemon={pokemons.length} totalCount={totalCount} />
        </header>
        <div className="flex justify-start md:hidden pt-2 bg-gray-800">
          <FilterCount displayedPokemon={pokemons.length} totalCount={totalCount} view={'mobile'} />
          <MobileFilter expand={expand} specialSpecies={specialSpecies} view={'mobile'} />
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {pokemons.map((pokemon) => (
              <PokemonCard
                key={pokemon.name}
                id={pokemon.id}
                url={pokemon.image}
                name={pokemon.name}
                description={pokemon.description || pokemon.descriptions}
                price={pokemon.pokemons_selling?.regular_price}
              />
            ))}
          </div>
          <div ref={ref} className="col-span-full text-center py-8">
            {isFetchingNextPage
              ? 'Loading more...'
              : hasNextPage
                ? 'Scroll for more'
                : 'No more items'}
          </div>
        </div>
      </div>
    </>
  );
}
