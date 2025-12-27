import { auth } from '../_lib/auth';
import { getCartItems } from '../_lib/data-service';
import InfinitePokemonList from './../_component/InfinitePokemonList';
export const metadata = {
  title: 'About',
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const cartFromDatabase = await getCartItems();
  const session = await auth();

  return (
    <div className=" bg-amber-500 ">
      <InfinitePokemonList species={params.species} user={session?.user}>
        {cartFromDatabase}
      </InfinitePokemonList>
    </div>
  );
}
