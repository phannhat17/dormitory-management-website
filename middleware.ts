import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  adminPrefix,
  allUserAcessRoute,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "./routes";
import arcjet, { createMiddleware, shield } from "@arcjet/next";
import type { NextMiddleware, NextRequest } from "next/server";
import { NextResponse } from "next/server";
// @ts-ignore
import type { NextAuthRequest } from "next-auth";

// Initialize NextAuth with your configuration
const { auth } = NextAuth(authConfig);

// Arcjet configuration
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
    // Additional rate limiting or other rules can be added here
  ],
});

// Auth middleware
const authMiddleware: NextMiddleware = async (req: NextRequest) => {
  const { nextUrl } = req;
  const session = await auth(req as unknown as NextAuthRequest); // Cast to the expected type for auth function
  const isLoggedIn = !!session;
  const isBanned = session?.user?.status === "BANNED";
  const isAdmin = session?.user?.role === "ADMIN";

  const isAdminRoute = nextUrl.pathname.startsWith(adminPrefix);
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoutes = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAllAccessRoute = allUserAcessRoute.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isBanned) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (isLoggedIn) {
    if (isAllAccessRoute) {
      return NextResponse.next();
    }

    if (!isAdmin && isAdminRoute) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    if (isAdmin && !isAdminRoute) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
  }

  if (!isLoggedIn && !isPublicRoutes) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return NextResponse.next();
};

// Middleware configuration
export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files.
    // Exclude files in the _next directory, which are Next.js internals.
    "/((?!.+\\.[\\w]+$|_next).*)",
    // Re-include any files in the api or trpc folders that might have an extension
    "/(api|trpc)(.*)",
  ],
};

// Combine Arcjet and Auth middlewares
export default createMiddleware(aj, authMiddleware);
