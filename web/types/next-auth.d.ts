// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";
import { Role, UserStatus } from "./common";

/**
 * Extends NextAuth module with custom user properties.
 */
declare module "next-auth" {
  interface User {
    id: string;
    fullName: string;
    role: Role;
    status: UserStatus;
  }

  /**
   * Extends session user data with custom fields.
   */
  interface Session {
    user: {
      id: string;
      fullName: string;
      role: Role;
      status: UserStatus;
    } & Session["user"];
  }
}

/**
 * Extends JWT payload with custom user fields.
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    fullName: string;
    role: Role;
    status: UserStatus;
  }
}