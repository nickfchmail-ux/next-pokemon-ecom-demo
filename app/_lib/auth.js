import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createMember, getUser } from './data-service';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // Infuse this
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },

  callbacks: {
    async authorized({ auth, request }) {
      return !!auth?.user;
    },

    async signIn({ user, profile }) {
      try {
        let existingMember = await getUser(user.email);

        if (!existingMember) {
          const firstName = profile?.given_name || user.name?.split(' ')[0] || '';
          const lastName = profile?.family_name || user.name?.split(' ').slice(1).join(' ') || '';

          existingMember = await createMember({
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            image: user?.image,
          });
        }

        user.id = existingMember.id;
        user.image = existingMember.image;
        return true;
      } catch (error) {
        console.error('Error during signIn callback:', error);
        return false;
      }
    },

    // Store custom data (like DB id) in the JWT token
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },

    // Enrich the session with data from the token (safe & fast, no DB call)
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
});
