import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { checkRateLimit, isBot } from "./lib/security";
import { NextResponse } from "next/server";

// Define public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/case-studies/(.*)", // Allows viewing, but we must protect /new specifically
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/case-studies/new", // Explicitly protect creation page
  "/api/case-studies", // Explicitly protect creation API
  "/vc-reports(.*)",
  "/api/payments(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Bot Protection
  const userAgent = req.headers.get("user-agent");
  if (isBot(userAgent)) {
    return new NextResponse("Forbidden: Automated access is not allowed.", { status: 403 });
  }

  // 2. Rate Limiting
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  } else if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
