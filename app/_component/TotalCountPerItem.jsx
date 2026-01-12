import CalculateIcon from '@mui/icons-material/Calculate';
import { useSelector } from 'react-redux';
import useGetPokemon from '../_state/_remote/pokemon/useGetPokemon';
export default function TotalCountPerItem({ id }) {
  const { pokemonList } = useGetPokemon();

  if (!pokemonList) return;

  const selectedPokemon = pokemonList.filter((pokemon) => pokemon.id === id).at(0);
  const quantity = useSelector((state) => state.cart.cart)
    .filter((item) => item.id === id)
    ?.at(0)?.quantity;



  const price = selectedPokemon.pokemons_selling.regular_price;
  const discount = selectedPokemon.pokemons_selling.discount;
  const priceAfterDiscount = price * (1 - discount / 100);
  const formatedTotalPrice = (quantity * priceAfterDiscount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (!id) return;

  return (
    <div
      className={`w-max text-sm sm:text-sm md:text-sm space-x-1 text-gray-300 flex place-items-center`}
    >
      <div className={`items-center mb-1`}>
        <CalculateIcon fontSize="5px" />
      </div>
      <div>${formatedTotalPrice}</div>
    </div>
  );
}
