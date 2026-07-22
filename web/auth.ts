import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserForSignin } from "./lib/actions/admin/auth.action";
import { verifyPassword } from "./lib/helpers/password";
import { SignInFormSchema } from "./lib/zod/schema";
import type { User } from "next-auth";

/**
 * Configures NextAuth authentication with credentials provider.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  /**
   * Secret key.
   */
  secret: process.env.AUTH_SECRET,

  /**
   * Defines authentication pages.
   */
  pages: {
    signIn: "/sign-in",
  },

  /**
   * Configures session management strategy.
   */
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      /**
       * Authorizes user credentials with database validation.
       */
      async authorize(credentials) {
        const parsed = SignInFormSchema.parse(credentials);
        const { cnic, password } = parsed;

        const user = await getUserForSignin(cnic);

        if (!user) return null;

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) return null;

        const { password: _, ...safeUser } = user;

        return safeUser as User;
      },
    }),
  ],

  callbacks: {
    /**
     * Adds user data to JWT token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fullName = user.fullName;
        token.role = user.role;
        token.status = user.status;
      }

      return token;
    },

    /**
     * Adds JWT data to session user.
     */
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.fullName = token.fullName;
      session.user.role = token.role;
      session.user.status = token.status;

      return session;
    },
  },
});