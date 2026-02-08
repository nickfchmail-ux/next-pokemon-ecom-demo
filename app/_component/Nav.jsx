import AuthButton from '../_component/AuthButton';
import VisitorMonitor from '../_component/VisitorMonitor';
import { auth } from '../_lib/auth';
import Logo from './Logo';
import NavigationLink from './NavigationLink';
async function Nav() {
  const session = await auth();

  return (
    <nav className="h-min border-b border-b-primary-400 ">
      <div className="flex items-center  max-w-7xl mx-auto justify-between">
        <Logo />
        <VisitorMonitor />
        <ul className="flex items-center gap-6 p-4">
          <div className="hidden sm:hidden md:flex rounded-base shadow-xs -space-x-px ">
            <NavigationLink user={session?.user} />
          </div>

          <AuthButton user={session?.user} />
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
