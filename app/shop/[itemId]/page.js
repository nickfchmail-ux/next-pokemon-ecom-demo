import Image from 'next/image';
import AddToCartButton from '../../_component/AddToCartButton';
import AmendCartQuanityButton from '../../_component/AmendCartQuanityButton';
import BackButton from '../../_component/BackButton';
import PurchaseQuanity from '../../_component/PurchaseQuanity';
import Text from '../../_component/Text';
import { getPokemonById } from '../../_lib/data-service';
export async function generateMetadata({ params }) {
  const { itemId } = await params;

  const selectedPokemon = await getPokemonById(itemId);
  const { name } = selectedPokemon;

  return { title: `${name}` };
}

export default async function Page({ params }) {
  const { itemId } = await params;

  const selectedPokemon = await getPokemonById(itemId);

  const { image, name, descriptions, species } = selectedPokemon;

  const unitedSpecies = new Set(species);

  return (
    <>
      <div className="bg-primary-700 flex flex-col md:flex-row min-h-[82.5vh] justify-center">
        <div className="bg-primary-800 flex  flex-col items-center justify-center min-w-50 ">
          <h1 className=" text-primary-50 p-2">{name}</h1>
          <div className={`flex gap-2 flex-wrap justify-center w-full relative`}>
            {Array.from(unitedSpecies).map((spec) => (
              <Image
                src={`/${spec}.png`}
                width={100}
                height={10}
                key={`${image}-detail-page-${name}-${spec}`}
                alt={name}
              />
            ))}
          </div>
          <Image
            src={image}
            width={300}
            height={300}
            className="object-cover aspect-square mt-10"
            alt="image"
          />
        </div>
        <div
          className={`flex flex-1 flex-col md:min-h-[82.5vh] space-y-5 text-primary-50 w-full p-5 justify-center `}
        >
          <div className="flex-1 flex flex-col justify-center ">
            <h1 className={`my-5`}>Descriptions: </h1>
            <Text textArray={descriptions} />

            <div className={`mt-3`}>
              <PurchaseQuanity id={selectedPokemon?.id} view={'cart'} />
            </div>
          </div>

          <div className={`flex justify-between p-2 mt-auto    w-full`}>
            <div>
              <AddToCartButton id={selectedPokemon?.id} view={'detail'} />
              <AmendCartQuanityButton id={selectedPokemon?.id} alt={name} view={'detail'} />
            </div>
            <BackButton />
          </div>
        </div>
      </div>
    </>
  );
}
