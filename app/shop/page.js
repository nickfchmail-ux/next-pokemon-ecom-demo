import { auth } from '../_lib/auth';
import { getCartItems } from '../_lib/data-service';
import InfinitePokemonList from './../_component/InfinitePokemonList';
export const metadata = {
  title: 'Shop',
  description: 'A poke 芒 product page where you can select pokemon and add it to your cart.',
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const cartFromDatabase = await getCartItems();
  const session = await auth();

  return (
    <InfinitePokemonList species={params.species} user={session?.user}>
      {cartFromDatabase}
    </InfinitePokemonList>
  );
}
