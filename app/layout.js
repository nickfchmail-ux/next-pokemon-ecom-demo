import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Josefin_Sans, Nunito } from 'next/font/google';
import { Toaster } from 'sonner';
import { auth } from '../app/_lib/auth';
import ChatBox from './_component/ChatBox';
import Footer from './_component/Footer';
import Nav from './_component/Nav';
import NavigationLink from './_component/NavigationLink';
import Providers from './_component/Providers';
import './globals.css';
const josefin = Josefin_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'], // Add weights you need
  display: 'swap',
});

export const metadata = {
  title: {
    template: '%s - Poke芒',
    default: 'Welcome - Poke芒',
  },

  description:
    'A pokemon store, where you could find your companies along with your adventure. Lets start and explore...',
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${josefin.className} ${nunito.className} flex flex-col bg-primary-950 min-h-screen text-primary-50 `}
      >
        <Providers>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
          <Nav />

          <main className="bg-primary-950 flex-1 ">
            <ChatBox />
            <div className="max-w-7xl mx-auto bg-primary-800 md:max-w-[90vw]">{children}</div>
          </main>
          <div className={`flex sticky bottom-0 md:hidden justify-evenly bg-primary-800`}>
            <NavigationLink view={'mobile'} user={session?.user} />
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
