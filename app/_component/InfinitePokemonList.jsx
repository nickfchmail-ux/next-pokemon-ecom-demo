'use client';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useScroll } from 'motion/react'; // Added useMotionValueEvent
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItemsAction } from '../_lib/actions';
import { getPokemons } from '../_lib/data-client-service';
import { synchronizeRemoteCartData } from '../_state/_global/cart/CartSlice';
import Loading from '../loading';
import ExpandButton from './ExpandButton';
import FilterCount from './FilterCount';
import MobileFilter from './MobileFilter';
import PokemonCard from './PokemonCard';
import TagFilter from './TagFilter';

function PokemonListContent({
  pokemons,
  totalCount,
  specialSpecies,
  expand,
  setExpand,
  headerRef,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) {
  const containerRef = useRef(null);
  const { ref, inView } = useInView();
  const { scrollY } = useScroll({ container: containerRef });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
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
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-gray-100">
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
    </>
  );
}

export default function InfinitePokemonList({ user, children }) {
  const [hasDoneInitialCartUpdate, setHasDoneInitialCartUpdate] = useState(false); // Fixed typo
  const [expand, setExpand] = useState(false);
  const searchParams = useSearchParams();
  const tags = searchParams.getAll('tag');
  const headerRef = useRef(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);

  const {
    mutate: updatePokemon,
    isPending,
    isError,
    error: updateError,
  } = useMutation({
    mutationFn: updateCartItemsAction,
    onSuccess: (data) => {

    },
    onError: (err) => {

    },
  });

  useEffect(() => {
    if (!children) return;
    const previousCartItems = children.map((item) => ({
      id: item.pokemon_id,
      quantity: item.quantity,
    }));

    dispatch(synchronizeRemoteCartData(previousCartItems));
    setHasDoneInitialCartUpdate(true);
  }, []);

  useEffect(() => {
    if (!hasDoneInitialCartUpdate) return;
    if (cart?.length >= 0) {
      updatePokemon(cart);
    }
  }, [cart, hasDoneInitialCartUpdate]); // Added dependency

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ['pokemons', tags],
    queryFn: ({ pageParam }) => getPokemons({ pageParam, species: tags }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

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

  if (status === 'pending') return <Loading />;
  if (status === 'error') return <div>Error: {error.message}</div>;

  const pokemons = data.pages.flatMap((page) => page.pokemons);
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const specialSpecies = data?.pages[0]?.speciesList ?? [];

  return (
    <div className="h-[87vh] flex flex-col">
      <PokemonListContent
        pokemons={pokemons}
        totalCount={totalCount}
        specialSpecies={specialSpecies}
        expand={expand}
        setExpand={setExpand}
        headerRef={headerRef}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}
