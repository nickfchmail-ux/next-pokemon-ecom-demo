import CartView from '../_component/CartView';
import { auth } from '../_lib/auth';
export default async function Page() {
  const session = await auth();

  return <CartView user={session?.user} />;
}
