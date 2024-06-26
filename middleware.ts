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
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // console.log("Authentication is enabled for " + req.auth?.user.status);
  const isBanned = req.auth?.user.status === "BANNED";
  const isAdmin = req.auth?.user.role === "ADMIN";

  const isAdminRoute = nextUrl.pathname.startsWith(adminPrefix);
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoutes = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAllAccessRoute = allUserAcessRoute.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }

  if (isBanned) {
    req.auth = null;
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (isLoggedIn) {
    if (isAllAccessRoute) {
      return;
    }

    if (!isAdmin && isAdminRoute) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    if (isAdmin && !isAdminRoute) {
      return Response.redirect(new URL("/admin", nextUrl));
    }
  }

  if (!isLoggedIn && !isPublicRoutes) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }
  return;
});

export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files.
    // Exclude files in the _next directory, which are Next.js internals.
    "/((?!.+\\.[\\w]+$|_next).*)",
    // Re-include any files in the api or trpc folders that might have an extension
    "/(api|trpc)(.*)",
  ],
};
