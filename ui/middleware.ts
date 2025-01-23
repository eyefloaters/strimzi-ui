import { locales, routing } from "@/i18n/routing";
import withAuth from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";

const log = logger.child({ module: "middleware" });

const publicPages = ["/kafka/[^/]+/login", "/cluster", "/", "/schema"];
const protectedPages = ["/kafka/[^/]+/.*"];

const intlMiddleware = createIntlMiddleware(routing);

const authMiddleware = withAuth(
  // Note that this callback is only invoked if
  // the `authorized` callback has returned `true`
  // and not for pages listed in `pages`.
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      //signIn: `/kafka/1/login`,
    },
  },
) as any;

const publicPathnameRegex = RegExp(
  `^(/(${locales.join("|")}))?(${publicPages
    .flatMap((p) => (p === "/" ? ["", "/"] : p))
    .join("|")})/?$`,
  "i",
);

const protectedPathnameRegex = RegExp(
  `^(/(${locales.join("|")}))?(${protectedPages
    .flatMap((p) => (p === "/" ? ["", "/"] : p))
    .join("|")})/?$`,
  "i",
);

export default async function middleware(req: NextRequest) {
  /*
   * Next.js middleware doesn't support reading files, so here we make a (cached)
   * call to the /config endpoint within the same application :(
   */
  let oidcEnabled = await fetch(`http://127.0.0.1:${process.env.PORT}/config`, {
    cache: "force-cache",
  })
    .then((cfg) => cfg.json())
    .then((cfg) => cfg["oidc"]);

  const searchParams = req.nextUrl.searchParams;
  const requestPath = req.nextUrl.pathname;

  // Explicitly check if the request is for `/api/schema` with required query parameters
  const isSchemaPublic =
    requestPath === "/api/schema" &&
    searchParams.has("content") &&
    searchParams.has("schemaname");

  if (isSchemaPublic) {
    log.info(
      { path: requestPath },
      "Bypassing OIDC authentication for /api/schema",
    );
    return NextResponse.next(); // Allow access without authentication
  }

  const isPublicPage = !oidcEnabled && publicPathnameRegex.test(requestPath);
  const isProtectedPage =
    oidcEnabled || protectedPathnameRegex.test(requestPath);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else if (isProtectedPage) {
    return authMiddleware(req);
  } else {
    log.debug(
      {
        requestPath: requestPath,
        publicPathnameRegex: publicPathnameRegex,
        protectedPathnameRegex: protectedPathnameRegex,
      },
      "neither public nor protected!",
    );
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "healthz", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ["/((?!api|config|healthz|_next|.*\\..*).*)"],
};
