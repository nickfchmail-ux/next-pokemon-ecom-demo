import CartView from '../_component/CartView';
import { auth } from '../_lib/auth';
import { getCartItems } from '../_lib/data-service';

export const metadata = {
  title: 'Cart',
  description: 'View and manage items in your shopping cart.',
};

export default async function Page() {
  const session = await auth();
  const cartFromDatabase = await getCartItems();
  return <CartView>{{ cartFromDatabase: cartFromDatabase, user: session?.user }}</CartView>;
}
