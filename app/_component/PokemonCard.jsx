import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import AddToCartButton from './AddToCartButton';
import AmendCartQuanityButton from './AmendCartQuanityButton';
import PokemonDetailNavigationImage from './PokemonDetailNavigationImage';
import Price from './Price';
import PurchaseQuantity from './PurchaseQuanity';
function PokemonCard({ name, url, id, description, price }) {
  const router = useRouter();
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const purchaseQuantity = cart.filter((item) => item?.id === id)?.at(0)?.quantity;

  const hasItemInCart = purchaseQuantity > 0;

  const goToPokemon = () => {
    router.push(`/shop/${id}`);
  };
  return (
    <div
      className="
      bg-white
      shadow-md
      h-75
      mx-3
      rounded-3xl
      flex flex-col
          justify-around
          items-center
          overflow-hidden
          sm:flex-row sm:h-52 sm:w-full

          p-2
      relative

          "
    >
      <div className=" grid w-[300px] sm:h-full sm:w-[300px] place-items-center min-h-37.5 hover:bg-amber-50 ">
        {purchaseQuantity > 0 && <PurchaseQuantity id={id} />}
        <PokemonDetailNavigationImage id={id} />
      </div>

      <div
        className="
            flex-1
            w-full
            flex flex-col
            items-baseline
            justify-around
            h-1/2
            pl-6
            sm:h-full sm:items-baseline sm:w-1/2
            "
      >
        <div className="flex flex-col justify-start items-baseline">
          <h1 className="text-lg font-normal mb-0 text-gray-600 font-sans w-max ">{name}</h1>
          <span className="text-xs text-indigo-300 mt-0">by supplier</span>
        </div>
        <p className="text-xs text-gray-500 w-4/5 line-clamp-1">{description}</p>
        <div className="w-full flex flex-wrap justify-between items-center md:flex-col lg:flex-row relative">
          <Price price={price} />
          {!hasItemInCart && <AddToCartButton id={id} />}
          {hasItemInCart && <AmendCartQuanityButton id={id} />}
        </div>
      </div>
    </div>
  );
}

export default PokemonCard;
