import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useGetPokemon from '../_state/_remote/pokemon/useGetPokemon';
export default function PokemonDetailNavigationImage({ id, view }) {
  const router = useRouter();
  const { pokemonList } = useGetPokemon();

  if (!pokemonList) return;

  const selectedPokemon = pokemonList.filter((pokemon) => pokemon.id === id).at(0);

  const goToPokemon = () => {
    router.push(`/shop/${id}`);
  };

  return (
    <button onClick={goToPokemon} className="group cursor-pointer ">
      {view?.toLowerCase() !== 'cart' ? (
        <Image
          src={selectedPokemon.image}
          height={150}
          width={150}
          alt={name}
          className="object-cover hover:bg-amber-50 hover:perspective-[-20px] hover:rotate-x-[10deg] hover:rotate-y-[0deg]"
        />
      ) : (
        <Image
          src={selectedPokemon.image}
          fill
          alt={name}
          className=" object-contain hover:bg-amber-50"
        />
      )}
    </button>
  );
}
