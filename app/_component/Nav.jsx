import AuthButton from '../_component/AuthButton';
import { getUserAction } from '../_lib/actions';
import { auth } from '../_lib/auth';
import Logo from './Logo';
import NavigationLink from './NavigationLink';
async function Nav() {
  let user;

  const session = await auth();

  if (session) {
    console.log('session', session);
    user = await getUserAction(session.user?.email);
  }

  return (
    <nav className="h-min border-b border-b-amber-600">
      <div className="flex items-center  max-w-7xl mx-auto justify-between">
        <Logo />
        <ul className="flex items-center gap-6 p-4">
          <div className="hidden sm:hidden md:flex rounded-base shadow-xs -space-x-px">
            <NavigationLink />
          </div>

          <AuthButton user={user} />
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
