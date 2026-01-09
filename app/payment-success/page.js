import ThankYouForShoppingMessage from '../_component/ThankYouForShoppingMessage';
import { auth } from '../_lib/auth';
import { getUser } from '../_lib/data-service';
export default async function Page({ searchParams }) {
  const session = await auth();
  const { id, created_at, ...userProfile } = await getUser(session.user.email);
  const params = await searchParams;
  const payment = params.amount || '0';

  return (
    <div className={`w-full h-[83.5vh] over`}>
      <ThankYouForShoppingMessage />;
    </div>
  );
}
