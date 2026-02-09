import PokemonDetails from '../../_component/PokemonDetails';
import { getCartItems, getPokemonById } from '../../_lib/data-service';



export async function generateMetadata({ params }) {
  const { itemId } = await params;
  const { name } = await getPokemonById(itemId);

  return { title: `${name}` };
}


export default async function Page({ params }) {
  const { itemId } = await params;

  const selectedPokemon = await getPokemonById(itemId);
  const cartFromDatabase = await getCartItems();
  return <PokemonDetails selectedPokemon={selectedPokemon} cartData={cartFromDatabase} />;
}
