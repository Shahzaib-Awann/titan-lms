import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User } from "next-auth";

import { authConfig } from "./auth.config";
import { getUserForSignin } from "./lib/actions/auth.action";
import { verifyPassword } from "./lib/helpers/password";
import { SignInFormSchema } from "./lib/zod/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = SignInFormSchema.parse(credentials);

        const { cnic, password } = parsed;

        const user = await getUserForSignin(cnic);

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(
          password,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        const { password: _password, ...safeUser } = user;

        return safeUser as User;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
});