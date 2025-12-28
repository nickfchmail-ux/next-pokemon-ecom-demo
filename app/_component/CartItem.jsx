import Image from 'next/image';
import AmendCartQuanityButton from './AmendCartQuanityButton';
import PokemonDetailNavigationImage from './PokemonDetailNavigationImage';
import Price from './Price';
import PurchaseQuanity from './PurchaseQuanity';
import TotalCountPerItem from './TotalCountPerItem';

export default function CartItem({ item, isInView, ref }) {
  if (!item) return;
  console.log('is in view: ', isInView);
  return (
    <div
      ref={ref}
      className={`flex-1 bg-white flex m-2 drop-shadow-lg rounded-[15px]  min-w-[150px] md:flex-row flex-col md:flex-row p-1 md:p-5 h-full sm:h-[70vh] md:h-max`}
    >
      <div className={`flex-1 min-w-[100px] min-h-[100px]  relative flex-1 rounded-[15px] md:mr-5`}>
        <PokemonDetailNavigationImage id={item.id} view={'cart'} />
      </div>

      <div
        className={`min-w-[40%] flex  my-5 space-y-2 justify-between mb-2 flex-col md:flex-row `}
      >
        <div>
          <span className={`flex flex-col mb-2 w-full w-max text-2xl`}>{item.name}</span>
          <span className="flex gap-2 flex-wrap md:mb-5">
            {item.species.map((sp) => (
              <Image key={sp} src={`/${sp}.png`} height={50} width={50} alt={sp} />
            ))}
          </span>
          <div className={`md:mb-5`}>
            <PurchaseQuanity id={item.id} view={'Cart'} />
          </div>
        </div>
        <div
          className={`flex flex-row md:flex-col justify-between  self-end w-full md:items-end md:mr-5`}
        >
          <div>
            <span className=" text-red-500 w-min">
              <span className="line-through text-sm   text-gray-400 font-light w-max w-min md:pr-5 ">
                ${item.pokemons_selling.regular_price}
              </span>
            </span>
            <Price
              price={(
                item.pokemons_selling.regular_price *
                (1 - item.pokemons_selling.discount / 100)
              ).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
          </div>
          <div>
            <TotalCountPerItem id={item.id} />
            <AmendCartQuanityButton id={item.id} view={'mobile'} />
          </div>
        </div>
      </div>
    </div>
  );
}
