import type { NextAuthConfig } from "next-auth";
import type { Role } from "./types/common";

const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  trainer: "/trainer",
  student: "/student",
};

function getRoleHome(role?: Role) {
  return role ? ROLE_HOME[role] : "/";
}

export const authConfig = {
  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      const user = auth?.user;
      const role = user?.role as Role | undefined;

      // Authenticated users should not access sign-in.
      if (pathname === "/sign-in" && role) {
        return Response.redirect(
          new URL(getRoleHome(role), request.nextUrl),
        );
      }

      // Admin routes
      if (pathname.startsWith("/admin")) {
        if (!user) {
          return false;
        }

        return role === "admin";
      }

      // Student routes
      if (pathname.startsWith("/student")) {
        if (!user) {
          return false;
        }

        return role === "student";
      }

      // Trainer routes
      if (pathname.startsWith("/trainer")) {
        if (!user) {
          return false;
        }

        return role === "trainer";
      }

      return true;
    },

    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fullName = user.fullName;
        token.role = user.role;
        token.status = user.status;
      }

      return token;
    },

    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.fullName = token.fullName as string;
      session.user.role = token.role as Role;
      session.user.status = token.status;

      return session;
    },
  },

  providers: [],
} satisfies NextAuthConfig;